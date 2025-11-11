import React, { useState, useEffect } from 'react';

interface Expense {
  expense_id: number;
  name: string;
  date: string;
  cost: number;
  status: 'approved' | 'cancelled';
  created_at: string;
}

interface ExpenseTotals {
  total: number;
  approved: number;
  cancelled: number;
}

export const ManagerExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<ExpenseTotals>({ total: 0, approved: 0, cancelled: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', date: '', cost: 0, status: 'approved' as const });

  const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
  const isAdmin = userRole === 'admin';

  const fetchExpenses = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const [expensesRes, totalsRes] = await Promise.all([
        fetch(`https://atara-dajy.onrender.com/admin/expenses?page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
        fetch(`https://atara-dajy.onrender.com/admin/expenses/totals`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
      ]);

      if (!expensesRes.ok || !totalsRes.ok) throw new Error('Failed to fetch expenses');
      
      const expensesData = await expensesRes.json();
      const totalsData = await totalsRes.json();
      
      setExpenses(expensesData.data || []);
      setTotalPages(expensesData.pages || 1);
      setCurrentPage(page);
      setTotals(totalsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`https://atara-dajy.onrender.com/admin/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });

      if (!res.ok) throw new Error('Failed to create expense');
      await fetchExpenses(currentPage);
      setShowCreateModal(false);
      setNewExpense({ name: '', date: '', cost: 0, status: 'approved' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'approved' | 'cancelled') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://atara-dajy.onrender.com/admin/expenses/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      await fetchExpenses(currentPage);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
  }, []);

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>💰 Expenses Management</h3>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            >
              ➕ Add Expense
            </button>
          )}
        </div>

        {/* Totals Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div style={{ backgroundColor: '#E3F2FD', padding: 12, borderRadius: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#1565C0', fontWeight: 'bold' }}>TOTAL EXPENSES</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1565C0' }}>KES {totals.total.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#2E7D32', fontWeight: 'bold' }}>APPROVED</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#2E7D32' }}>KES {totals.approved.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div style={{ backgroundColor: '#FFEBEE', padding: 12, borderRadius: 4, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#C62828', fontWeight: 'bold' }}>CANCELLED</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#C62828' }}>KES {totals.cancelled.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', color: '#999' }}>Loading expenses...</div>}

        {!loading && expenses.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999' }}>No expenses found</div>
        )}

        {!loading && expenses.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: 'bold' }}>Date</th>
                    <th style={{ padding: 12, textAlign: 'right', fontWeight: 'bold' }}>Cost</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>Status</th>
                    <th style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => (
                    <tr key={expense.expense_id} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: 12 }}><strong>{expense.name}</strong></td>
                      <td style={{ padding: 12 }}>{new Date(expense.date).toLocaleDateString()}</td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 'bold' }}>KES {expense.cost.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: expense.status === 'approved' ? '#E8F5E9' : '#FFEBEE',
                          color: expense.status === 'approved' ? '#2E7D32' : '#C62828',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 'bold',
                        }}>
                          {expense.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <select
                          value={expense.status}
                          onChange={(e) => updateStatus(expense.expense_id, e.target.value as 'approved' | 'cancelled')}
                          style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 11 }}
                        >
                          <option value="approved">Approved</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                <button
                  onClick={() => fetchExpenses(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                  }}
                >
                  ← Previous
                </button>
                <span style={{ alignSelf: 'center', color: '#666', fontSize: 12 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchExpenses(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    backgroundColor: currentPage === totalPages ? '#f5f5f5' : 'white',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: '90%', maxWidth: 400, padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Add New Expense</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 12 }}>Name</label>
              <input
                type="text"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 12 }}>Date</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 12 }}>Cost (KES)</label>
              <input
                type="number"
                step="0.01"
                value={newExpense.cost}
                onChange={(e) => setNewExpense({ ...newExpense, cost: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                placeholder="Enter amount in Kenyan Shillings"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 12 }}>Status</label>
              <select
                value={newExpense.status}
                onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value as 'approved' | 'cancelled' })}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
              >
                <option value="approved">Approved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={createExpense}
                disabled={loading || !newExpense.name || !newExpense.date}
                style={{
                  flex: 1,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '10px',
                  cursor: loading || !newExpense.name || !newExpense.date ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Creating...' : '💾 Create'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};