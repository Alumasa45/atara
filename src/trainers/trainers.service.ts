import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { Trainer } from './entities/trainer.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createTrainerDto: CreateTrainerDto) {
    const { user_id, email, name } = createTrainerDto as any;

    // ensure user exists
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) throw new NotFoundException('Associated user not found');

    // optional: ensure no trainer already linked to this user
    const existing = await this.trainerRepository
      .createQueryBuilder('trainer')
      .where('trainer.user_id = :userId', { userId: user_id })
      .getOne();
    if (existing)
      throw new ConflictException('Trainer already exists for this user');

    const trainer = new Trainer();
    trainer.user = user;
    trainer.name = createTrainerDto.name;
    trainer.specialty = createTrainerDto.specialty;
    trainer.phone = createTrainerDto.phone ?? null;
    trainer.email = createTrainerDto.email;
    trainer.bio = createTrainerDto.bio ?? null;
    trainer.status = createTrainerDto.status ?? trainer.status;

    const saved = await this.trainerRepository.save(trainer);
    return saved;
  }

  async findAll(opts?: { page?: number; limit?: number }) {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const limit =
      opts?.limit && opts.limit > 0 ? Math.min(opts.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.trainerRepository.findAndCount({
      skip,
      take: limit,
      order: { trainer_id: 'ASC' },
      relations: ['user'],
    });

    // Filter out trainers with deleted/null users and remove phone numbers
    const validTrainers = items.filter(trainer => trainer.user !== null);
    const publicItems = validTrainers.map(trainer => {
      const { phone, ...trainerWithoutPhone } = trainer;
      return {
        ...trainerWithoutPhone,
        profile_image: trainer.profile_image, // Ensure profile_image is included
      };
    });

    return { data: publicItems, total: validTrainers.length, page, limit };
  }

  async findOne(id: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { trainer_id: id },
      relations: ['user'],
    });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  async update(id: number, updateTrainerDto: UpdateTrainerDto) {
    const trainer = await this.trainerRepository.findOne({
      where: { trainer_id: id },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');

    // if user_id provided, ensure user exists and update relation
    const { user_id, ...rest } = updateTrainerDto as any;
    if (user_id) {
      const user = await this.userRepository.findOne({ where: { user_id } });
      if (!user) throw new NotFoundException('Associated user not found');
      trainer.user = user;
    }

    Object.assign(trainer, rest);
    const saved = await this.trainerRepository.save(trainer);
    return saved;
  }

  async remove(id: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { trainer_id: id },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');
    await this.trainerRepository.delete({ trainer_id: id });
    return { ok: true };
  }

  async updateProfileImage(id: number, imageUrl: string) {
    const trainer = await this.trainerRepository.findOne({
      where: { trainer_id: id },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');

    trainer.profile_image = imageUrl;
    const saved = await this.trainerRepository.save(trainer);
    return { message: 'Profile image updated successfully', trainer: saved };
  }
}
