import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseStatusDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles('admin')
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @Roles('admin', 'manager')
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    return this.expensesService.findAll(+page, +limit);
  }

  @Get('totals')
  @Roles('admin', 'manager')
  getTotals() {
    return this.expensesService.getTotalExpenses();
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateExpenseStatusDto) {
    return this.expensesService.updateStatus(+id, updateStatusDto);
  }
}