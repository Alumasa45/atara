import React from 'react';
import { ManagerExpenses } from '../components/ManagerExpenses';

export default function ExpensesPage() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">💰</div>
        <div>
          <div className="title">Expenses Management</div>
          <div className="muted">Manage business expenses and budgets</div>
        </div>
      </header>
      <ManagerExpenses />
    </div>
  );
}