import React, { useEffect, useState } from 'react';
import { getJson, postJson } from '../api';
import '../styles.css';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://atara-dajy.onrender.com';

interface User {
  user_id: number;
  username: string;
  email: string;
  phone?: string;
  role: 'client' | 'trainer' | 'manager' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (searchQuery) query.append('search', searchQuery);
        if (roleFilter !== 'all') query.append('filter', roleFilter);
        query.append('page', '1');
        query.append('limit', '50');

        const data = await getJson(`/admin/users?${query.toString()}`);
        setUsers(data?.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    let filtered = [...users];

    // Apply status filter (client-side since backend doesn't filter by status in query)
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, statusFilter]);

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // If status is suspended, delete the user instead
    if (editingUser.status === 'suspended') {
      return handleDeleteUser(editingUser.user_id);
    }

    try {
      const response = await fetch(
        `${BASE}/admin/users/${editingUser.user_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            role: editingUser.role,
            status: editingUser.status,
          }),
        },
      );

      if (!response.ok) throw new Error('Failed to update user');

      const updated = await response.json();
      setUsers(users.map((u) => (u.user_id === updated.user_id ? updated : u)));
      setShowEditForm(false);
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${BASE}/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter((u) => u.user_id !== userId));
      setShowEditForm(false);
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#9C27B0';
      case 'manager':
        return '#4CAF50';
      case 'trainer':
        return '#FF9800';
      case 'client':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'suspended':
        return '#F44336';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'red' }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">👥</div>
        <div>
          <div className="title">User Management</div>
          <div className="muted">Manage users and their roles</div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Summary Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Total Users
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {users.length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Admins
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#9C27B0' }}>
              {users.filter((u) => u.role === 'admin').length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Managers
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>
              {users.filter((u) => u.role === 'manager').length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Trainers
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#FF9800' }}>
              {users.filter((u) => u.role === 'trainer').length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Clients
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#2196F3' }}>
              {users.filter((u) => u.role === 'client').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Filters</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by username, email, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="trainer">Trainer</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <h3>Users ({filteredUsers.length})</h3>
          <div style={{ marginTop: 16, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Username
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <td style={{ padding: '12px' }}>{user.username}</td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {user.phone || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor: getRoleColor(user.role),
                          color: 'white',
                          fontSize: 11,
                        }}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor: getStatusColor(user.status),
                          color: 'white',
                          fontSize: 11,
                        }}
                      >
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: 11 }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowEditForm(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#1976D2',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p
                style={{ padding: '20px', textAlign: 'center', color: '#999' }}
              >
                No users found.
              </p>
            )}
          </div>
        </div>

        {/* Edit User Form */}
        {showEditForm && editingUser && (
          <div
            style={{
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
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: 500,
                width: '90%',
              }}
            >
              <h3>Edit User</h3>
              <div style={{ marginBottom: 16 }}>
                <strong>Username:</strong> {editingUser.username}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Email:</strong> {editingUser.email}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as any,
                    })
                  }
                  className="input"
                >
                  <option value="client">Client</option>
                  <option value="trainer">Trainer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      status: e.target.value as any,
                    })
                  }
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended (Delete User)</option>
                </select>
              </div>

              {editingUser.status === 'suspended' && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    backgroundColor: '#FFF3CD',
                    borderRadius: 4,
                    border: '1px solid #FFE69C',
                  }}
                >
                  <strong style={{ color: '#856404' }}>⚠️ Warning:</strong>
                  <p
                    style={{
                      margin: '8px 0 0 0',
                      fontSize: 12,
                      color: '#856404',
                    }}
                  >
                    Setting status to "Suspended" will permanently delete this
                    user from the system. This action cannot be undone.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleUpdateUser}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor:
                      editingUser.status === 'suspended'
                        ? '#F44336'
                        : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  {editingUser.status === 'suspended'
                    ? 'Delete User'
                    : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingUser(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#999',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
