import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MpesaTransaction } from './entities/mpesa-transaction.entity';
import { InitiatePaymentDto, MpesaCallbackDto } from './dto/mpesa.dto';

@Injectable()
export class MpesaService {
  private readonly consumerKey = process.env.MPESA_CONSUMER_KEY;
  private readonly consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  private readonly businessShortCode = '4188419';
  private readonly passkey = process.env.MPESA_PASSKEY;
  private readonly callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://atara-dajy.onrender.com/mpesa/callback';

  constructor(
    @InjectRepository(MpesaTransaction)
    private transactionRepository: Repository<MpesaTransaction>,
  ) {
    if (!this.consumerKey || !this.consumerSecret || !this.passkey) {
      console.warn('⚠️ M-Pesa environment variables not configured');
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from M-Pesa API');
    }

    try {
      const data = JSON.parse(text);
      if (!data.access_token) {
        throw new Error('No access token in response');
      }
      return data.access_token;
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text}`);
    }
  }

  private generateTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
           (now.getMonth() + 1).toString().padStart(2, '0') +
           now.getDate().toString().padStart(2, '0') +
           now.getHours().toString().padStart(2, '0') +
           now.getMinutes().toString().padStart(2, '0') +
           now.getSeconds().toString().padStart(2, '0');
  }

  private generatePassword(): string {
    const timestamp = this.generateTimestamp();
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return password;
  }

  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Must be 12 digits starting with 254
    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return cleaned;
    }
    
    // Convert 0712345678 to 254712345678
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    }
    
    // Convert 712345678 to 254712345678
    if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
      return '254' + cleaned;
    }
    
    return null; // Invalid format
  }

  async initiateSTKPush(paymentData: InitiatePaymentDto) {
    try {
      if (!this.consumerKey || !this.consumerSecret || !this.passkey) {
        throw new Error('M-Pesa credentials not configured');
      }

      // Validate and format phone number
      const phoneNumber = this.formatPhoneNumber(paymentData.phone_number);
      if (!phoneNumber) {
        throw new Error('Invalid phone number format');
      }

      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      const stkPushData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: paymentData.amount,
        PartyA: phoneNumber,
        PartyB: this.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: paymentData.account_reference,
        TransactionDesc: paymentData.transaction_desc,
      };

      const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(stkPushData),
      });

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from STK Push API');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (result.ResponseCode === '0') {
        const transaction = this.transactionRepository.create({
          checkout_request_id: result.CheckoutRequestID,
          merchant_request_id: result.MerchantRequestID,
          phone_number: paymentData.phone_number,
          amount: paymentData.amount,
          account_reference: paymentData.account_reference,
          transaction_desc: paymentData.transaction_desc,
          status: 'pending',
        });

        await this.transactionRepository.save(transaction);
      }

      return result;
    } catch (error) {
      console.error('M-Pesa STK Push Error:', error);
      throw new Error(`STK Push failed: ${error.message}`);
    }
  }

  async handleCallback(callbackData: MpesaCallbackDto) {
    const { stkCallback } = callbackData.Body;
    
    const transaction = await this.transactionRepository.findOne({
      where: { checkout_request_id: stkCallback.CheckoutRequestID },
    });

    if (transaction) {
      transaction.result_code = stkCallback.ResultCode.toString();
      transaction.result_desc = stkCallback.ResultDesc;
      transaction.status = stkCallback.ResultCode === 0 ? 'completed' : 'failed';

      if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
        const receiptItem = stkCallback.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
        if (receiptItem) {
          transaction.mpesa_receipt_number = receiptItem.Value;
        }
      }

      await this.transactionRepository.save(transaction);
    }

    return { message: 'Callback processed successfully' };
  }

  async getTransactionStatus(checkoutRequestId: string) {
    return this.transactionRepository.findOne({
      where: { checkout_request_id: checkoutRequestId },
    });
  }
}