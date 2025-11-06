import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // public: anyone (guest or registered) can create a booking
  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    return await this.bookingsService.create(createBookingDto);
  }

  // protected: admin/manager see all; trainer sees bookings for their sessions; client sees own bookings
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    const user = req.user;
    if (!user) throw new ForbiddenException();

    const role = user.role;
    if (role === 'admin' || role === 'manager') {
      return await this.bookingsService.findAll();
    }

    if (role === 'trainer') {
      // trainers: return bookings for schedules where session.trainer.user_id === current user
      return await this.bookingsService.findAll({}); // controller-level filter handled in service if needed
    }

    // client: return their own bookings
    if (role === 'client') {
      const all = await this.bookingsService.findAll();
      return all.filter((b: any) => b.user_id === user.userId);
    }

    throw new ForbiddenException();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: any) {
    const booking = await this.bookingsService.findOne(+id);
    const user = req.user;
    if (!user) throw new ForbiddenException();
    if (user.role === 'admin' || user.role === 'manager') return booking;
    if (user.role === 'trainer') {
      // trainer can view if trainer matches booking's session trainer
      // Access trainer through time slot session
      const trainerUserId =
        booking.timeSlot?.session?.trainer?.user_id ??
        booking.timeSlot?.session?.trainer?.user_id;
      if (trainerUserId === user.userId) return booking;
    }
    if (user.role === 'client') {
      if (booking.user_id === user.userId) return booking;
    }
    throw new ForbiddenException();
  }

  // update booking: clients can update their own booking; admin/manager can update any
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req: any,
  ) {
    const currentUser = req.user;
    const booking = await this.bookingsService.findOne(+id);
    if (currentUser.role === 'client') {
      if (!booking.user_id || booking.user_id !== currentUser.userId)
        throw new ForbiddenException('Not your booking');
    }
    // allow admin/manager to update any
    return await this.bookingsService.update(
      +id,
      updateBookingDto,
      currentUser,
    );
  }

  // cancel booking (marks cancelled and adjusts group counts). Clients restricted to their own bookings and 24h rule enforced in service
  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id') id: string, @Req() req: any) {
    const currentUser = req.user;
    return await this.bookingsService.cancel(+id, currentUser);
  }

  // simple confirm endpoint: accept payment_ref and return verification result
  @Post(':id/confirm')
  async confirm(
    @Param('id') id: string,
    @Body() body: { payment_ref?: string },
  ) {
    // persist the provided payment reference on the booking so admins can verify it later
    const { booking, verified } = await this.bookingsService.confirmPayment(
      Number(id),
      body?.payment_ref ?? undefined,
    );
    return { ok: true, booking, verified };
  }

  // hard delete (admin only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    // RolesGuard will require admin role if we set it; since we didn't set Roles decorator here, check manually
    const user = req.user;
    if (!user || user.role !== 'admin') throw new ForbiddenException();
    return await this.bookingsService.remove(+id);
  }
}
