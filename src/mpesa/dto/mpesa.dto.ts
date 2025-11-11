import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsNotEmpty()
  @IsString()
  phone_number: string;
  
  @IsNotEmpty()
  @IsNumber()
  amount: number;
  
  @IsNotEmpty()
  @IsString()
  account_reference: string;
  
  @IsNotEmpty()
  @IsString()
  transaction_desc: string;
}

export class MpesaCallbackDto {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: any;
        }>;
      };
    };
  };
}