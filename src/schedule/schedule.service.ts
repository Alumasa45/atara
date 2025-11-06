import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleDto, TimeSlotDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule } from './entities/schedule.entity';
import { ScheduleTimeSlot } from './entities/schedule-time-slot.entity';
import { Session } from '../sessions/entities/session.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleTimeSlot)
    private readonly timeSlotRepository: Repository<ScheduleTimeSlot>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto, userId?: number) {
    const { date, timeSlots } = createScheduleDto;

    // Validate all sessions exist
    for (const slot of timeSlots) {
      const session = await this.sessionRepository.findOne({
        where: { session_id: slot.session_id },
      });
      if (!session) {
        throw new NotFoundException(
          `Session with ID ${slot.session_id} not found`,
        );
      }
    }

    let creator: User | null = null;
    if (userId) {
      creator = await this.userRepository.findOne({
        where: { user_id: userId },
      });
    }

    // Create the schedule
    const schedule = new Schedule();
    schedule.date = new Date(date);
    if (creator) schedule.createdBy = creator;

    const savedSchedule = await this.scheduleRepository.save(schedule);

    // Create time slots
    const slots: ScheduleTimeSlot[] = [];
    for (const slot of timeSlots) {
      const timeSlot = new ScheduleTimeSlot();
      timeSlot.schedule = savedSchedule;
      timeSlot.session_id = slot.session_id;
      timeSlot.start_time = slot.start_time; // Already in HH:MM:SS format
      timeSlot.end_time = slot.end_time; // Already in HH:MM:SS format
      slots.push(timeSlot);
    }

    await this.timeSlotRepository.save(slots);

    // Return schedule with populated time slots
    return await this.findOne(savedSchedule.schedule_id);
  }

  async findAll(opts?: { page?: number; limit?: number }) {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const limit =
      opts?.limit && opts.limit > 0 ? Math.min(opts.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.scheduleRepository.findAndCount({
      skip,
      take: limit,
      order: { schedule_id: 'ASC' },
      relations: ['timeSlots', 'timeSlots.session', 'createdBy'],
    });

    return { data: items, total, page, limit };
  }

  async findByDate(date: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const schedules = await this.scheduleRepository.find({
      where: {
        date: startDate,
      },
      relations: ['timeSlots', 'timeSlots.session', 'createdBy'],
      order: { schedule_id: 'ASC' },
    });

    return schedules;
  }

  async findOne(id: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: { schedule_id: id },
      relations: [
        'timeSlots',
        'timeSlots.session',
        'timeSlots.session.trainer',
        'timeSlots.session.trainer.user',
        'createdBy',
      ],
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.scheduleRepository.findOne({
      where: { schedule_id: id },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const { date, timeSlots } = updateScheduleDto;

    if (date) {
      schedule.date = new Date(date);
    }

    const updatedSchedule = await this.scheduleRepository.save(schedule);

    if (timeSlots && timeSlots.length > 0) {
      // Delete old time slots
      await this.timeSlotRepository.delete({ schedule_id: id });

      // Validate all sessions exist
      for (const slot of timeSlots) {
        const session = await this.sessionRepository.findOne({
          where: { session_id: slot.session_id },
        });
        if (!session) {
          throw new NotFoundException(
            `Session with ID ${slot.session_id} not found`,
          );
        }
      }

      // Create new time slots
      const slots: ScheduleTimeSlot[] = [];
      for (const slot of timeSlots) {
        const timeSlot = new ScheduleTimeSlot();
        timeSlot.schedule = updatedSchedule;
        timeSlot.session_id = slot.session_id;
        timeSlot.start_time = slot.start_time; // Already in HH:MM:SS format
        timeSlot.end_time = slot.end_time; // Already in HH:MM:SS format
        slots.push(timeSlot);
      }

      await this.timeSlotRepository.save(slots);
    }

    return await this.findOne(id);
  }

  async remove(id: number) {
    const schedule = await this.scheduleRepository.findOne({
      where: { schedule_id: id },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    await this.scheduleRepository.delete({ schedule_id: id });
    return { ok: true };
  }
}
