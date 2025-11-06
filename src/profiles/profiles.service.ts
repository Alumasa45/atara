import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createForUser(user: User, initialPoints = 0) {
    let profile = await this.profileRepository.findOne({
      where: { user: { user_id: user.user_id } },
      relations: ['user'],
    });
    if (!profile) {
      profile = this.profileRepository.create({ user, points: initialPoints });
      return this.profileRepository.save(profile);
    }
    // if exists and initialPoints > 0, increment
    if (initialPoints > 0) {
      profile.points += initialPoints;
      return this.profileRepository.save(profile);
    }
    return profile;
  }

  async findByUserId(userId: number) {
    const p = await this.profileRepository.findOne({
      where: { user: { user_id: userId } },
      relations: ['user'],
    });
    if (!p) throw new NotFoundException('Profile not found');
    return p;
  }

  async addPoints(userId: number, points: number) {
    let profile = await this.profileRepository.findOne({
      where: { user: { user_id: userId } },
      relations: ['user'],
    });
    if (!profile) {
      // create profile record if missing
      profile = this.profileRepository.create({
        user: { user_id: userId } as any,
        points,
      });
      return this.profileRepository.save(profile);
    }
    profile.points = (profile.points || 0) + points;
    return this.profileRepository.save(profile);
  }

  async setPoints(userId: number, points: number) {
    const profile = await this.profileRepository.findOne({
      where: { user: { user_id: userId } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    profile.points = points;
    return this.profileRepository.save(profile);
  }
}
