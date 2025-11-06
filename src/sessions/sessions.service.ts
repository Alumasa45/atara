import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    const { trainer_id, created_by, ...rest } = createSessionDto as any;

    // if trainer_id provided, ensure trainer exists
    let trainer: Trainer | null = null;
    if (trainer_id) {
      trainer = await this.trainerRepository.findOne({ where: { trainer_id } });
      if (!trainer) throw new NotFoundException('Associated trainer not found');
    }

    // basic sanity checks
    if ((rest.capacity ?? 0) <= 0) {
      throw new ConflictException('Capacity must be greater than zero');
    }

    // category-specific capacity limits
    const capacityLimits: Record<string, number> = {
      pilates: 5,
      yoga: 10,
    };
    const limit = capacityLimits[rest.category];
    if (limit && rest.capacity > limit) {
      throw new ConflictException(
        `Capacity for ${rest.category} cannot exceed ${limit}`,
      );
    }

    const session = new Session();
    session.category = rest.category;
    session.description = rest.description;
    session.duration_minutes = rest.duration_minutes;
    session.capacity = rest.capacity;
    session.price = rest.price;
    if (trainer) session.trainer = trainer;
    if (created_by) {
      const user = await this.userRepository.findOne({
        where: { user_id: created_by },
      });
      if (!user) throw new NotFoundException('Creator user not found');
      session.createdBy = user;
    }

    const saved = await this.sessionRepository.save(session);
    return saved;
  }

  async findAll(opts?: { page?: number; limit?: number }) {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const limit =
      opts?.limit && opts.limit > 0 ? Math.min(opts.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.sessionRepository.findAndCount({
      skip,
      take: limit,
      order: { session_id: 'ASC' },
      relations: ['trainer', 'trainer.user', 'createdBy'],
    });

    return { data: items, total, page, limit };
  }

  async findOne(id: number) {
    const session = await this.sessionRepository.findOne({
      where: { session_id: id },
      relations: ['trainer', 'trainer.user', 'createdBy'],
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto) {
    const session = await this.sessionRepository.findOne({
      where: { session_id: id },
    });
    if (!session) throw new NotFoundException('Session not found');

    const { trainer_id, created_by, ...rest } = updateSessionDto as any;
    if (trainer_id) {
      const trainer = await this.trainerRepository.findOne({
        where: { trainer_id },
      });
      if (!trainer) throw new NotFoundException('Associated trainer not found');
      session.trainer = trainer;
    }

    if (created_by) {
      const user = await this.userRepository.findOne({
        where: { user_id: created_by },
      });
      if (!user) throw new NotFoundException('Creator user not found');
      session.createdBy = user;
    }

    // enforce capacity limits on update as well if capacity or category present
    const capacityLimits: Record<string, number> = {
      pilates: 5,
      yoga: 10,
    };
    const newCategory = rest.category ?? session.category;
    const newCapacity = rest.capacity ?? session.capacity;
    const limitForCategory = capacityLimits[newCategory];
    if (limitForCategory && newCapacity > limitForCategory) {
      throw new ConflictException(
        `Capacity for ${newCategory} cannot exceed ${limitForCategory}`,
      );
    }

    Object.assign(session, rest);
    const saved = await this.sessionRepository.save(session);
    return saved;
  }

  async remove(id: number) {
    const session = await this.sessionRepository.findOne({
      where: { session_id: id },
    });
    if (!session) throw new NotFoundException('Session not found');
    await this.sessionRepository.delete({ session_id: id });
    return { ok: true };
  }
}
