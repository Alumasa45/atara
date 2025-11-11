import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './entities/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mysecretkey',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}