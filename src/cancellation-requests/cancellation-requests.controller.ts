import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
} from '@nestjs/common';
import { CancellationRequestsService } from './cancellation-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('cancel-requests')
export class CancellationRequestsController {
  constructor(private readonly svc: CancellationRequestsService) {}

  // client submits a cancellation request for a booking
  @UseGuards(JwtAuthGuard)
  @Post('booking/:bookingId')
  async requestCancel(
    @Param('bookingId') bookingId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const bId = parseInt(bookingId, 10);
    await this.svc.create(bId, req.user, body?.message);
    return { message: 'Cancellation request sent.' };
  }

  // admin lists pending requests
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async list(@Request() req: any) {
    // RolesGuard should ensure admin/manager only; controller-level check optional
    return this.svc.listAll();
  }

  // admin approves
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Request() req: any) {
    const rid = parseInt(id, 10);
    return this.svc.approve(rid, req.user);
  }

  // admin rejects
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const rid = parseInt(id, 10);
    return this.svc.reject(rid, req.user, body?.reason);
  }
}
