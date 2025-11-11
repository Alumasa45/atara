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
  ) {}

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
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

  async initiateSTKPush(paymentData: InitiatePaymentDto) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      const stkPushData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: paymentData.amount,
        PartyA: paymentData.phone_number,
        PartyB: this.businessShortCode,
        PhoneNumber: paymentData.phone_number,
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

      const result = await response.json();

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