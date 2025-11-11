import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async create(@Body() createTrainerDto: CreateTrainerDto) {
    return await this.trainersService.create(createTrainerDto);
  }

  @Get()
  // public: clients can view trainers list
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    return await this.trainersService.findAll({ page: p, limit: l });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.trainersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
    @Req() req: any,
  ) {
    const currentUser = req.user;
    // admins and managers can update any trainer
    if (
      currentUser &&
      (currentUser.role === 'admin' || currentUser.role === 'manager')
    ) {
      return await this.trainersService.update(+id, updateTrainerDto);
    }

    // trainers can update their own trainer profile
    if (currentUser && currentUser.role === 'trainer') {
      const trainer = await this.trainersService.findOne(+id);
      const ownerUserId = trainer.user?.user_id ?? trainer.user_id;
      if (
        ownerUserId === currentUser.userId ||
        ownerUserId === currentUser.user_id
      ) {
        return await this.trainersService.update(+id, updateTrainerDto);
      }
    }

    throw new ForbiddenException('Not allowed to update this trainer');
  }

  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images/trainers',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `trainer-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const currentUser = req.user;
    if (
      currentUser &&
      (currentUser.role === 'admin' || currentUser.role === 'manager')
    ) {
      return await this.trainersService.updateProfileImage(+id, `/images/trainers/${file.filename}`);
    }

    if (currentUser && currentUser.role === 'trainer') {
      const trainer = await this.trainersService.findOne(+id);
      const ownerUserId = trainer.user?.user_id ?? trainer.user_id;
      if (
        ownerUserId === currentUser.userId ||
        ownerUserId === currentUser.user_id
      ) {
        return await this.trainersService.updateProfileImage(+id, `/images/trainers/${file.filename}`);
      }
    }

    throw new ForbiddenException('Not allowed to update this trainer image');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async remove(@Param('id') id: string) {
    return await this.trainersService.remove(+id);
  }


}
