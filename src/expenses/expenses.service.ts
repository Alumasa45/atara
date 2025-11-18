import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseStatusDto } from './dto/create-expense.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(createExpenseDto);
    const saved = await this.expenseRepository.save(expense);
    
    // Create notification for managers about new expense
    try {
      await this.notificationsService.createNewExpenseNotification(saved);
    } catch (error) {
      console.error('Failed to create expense notification:', error);
    }
    
    return saved;
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [data, total] = await this.expenseRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: number, updateStatusDto: UpdateExpenseStatusDto): Promise<Expense> {
    await this.expenseRepository.update(id, { status: updateStatusDto.status });
    const expense = await this.expenseRepository.findOne({ where: { expense_id: id } });
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
  }

  async getTotalExpenses(): Promise<{ total: number; approved: number; cancelled: number }> {
    const [total, approved, cancelled] = await Promise.all([
      this.expenseRepository
        .createQueryBuilder('expense')
        .select('SUM(expense.cost)', 'sum')
        .getRawOne(),
      this.expenseRepository
        .createQueryBuilder('expense')
        .select('SUM(expense.cost)', 'sum')
        .where('expense.status = :status', { status: 'approved' })
        .getRawOne(),
      this.expenseRepository
        .createQueryBuilder('expense')
        .select('SUM(expense.cost)', 'sum')
        .where('expense.status = :status', { status: 'cancelled' })
        .getRawOne(),
    ]);

    return {
      total: parseFloat(total?.sum || '0'),
      approved: parseFloat(approved?.sum || '0'),
      cancelled: parseFloat(cancelled?.sum || '0'),
    };
  }

  async clearAll(): Promise<{ message: string; deletedCount: number }> {
    const count = await this.expenseRepository.count();
    await this.expenseRepository.clear();
    return {
      message: 'All expenses cleared successfully',
      deletedCount: count,
    };
  }
}