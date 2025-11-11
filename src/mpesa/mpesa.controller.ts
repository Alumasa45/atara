import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { InitiatePaymentDto, MpesaCallbackDto } from './dto/mpesa.dto';

@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Post('pay')
  async initiatePayment(@Body() paymentData: InitiatePaymentDto) {
    return this.mpesaService.initiateSTKPush(paymentData);
  }

  @Post('callback')
  async handleCallback(@Body() callbackData: MpesaCallbackDto) {
    return this.mpesaService.handleCallback(callbackData);
  }

  @Get('status/:checkoutRequestId')
  async getTransactionStatus(@Param('checkoutRequestId') checkoutRequestId: string) {
    return this.mpesaService.getTransactionStatus(checkoutRequestId);
  }
}