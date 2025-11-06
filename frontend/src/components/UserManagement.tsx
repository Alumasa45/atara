import React, { useEffect, useState } from 'react';
import { getCurrentUserFromToken } from '../api';

interface User {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  email_verified: boolean;
}

interface UserManagementProps {
  onUserUpdate?: (user: User) => void;
  readOnly?: boolean;
}

export default function UserManagement({
  onUserUpdate,
  readOnly = false,
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const currentUser = getCurrentUserFromToken();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:3000/users?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.user_id);
    setEditForm(user);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const updatePayload: any = {};
      if (
        editForm.username !==
        users.find((u) => u.user_id === editingId)?.username
      ) {
        updatePayload.username = editForm.username;
      }
      if (
        editForm.email !== users.find((u) => u.user_id === editingId)?.email
      ) {
        updatePayload.email = editForm.email;
      }
      if (
        editForm.phone !== users.find((u) => u.user_id === editingId)?.phone
      ) {
        updatePayload.phone = editForm.phone;
      }
      if (editForm.role !== users.find((u) => u.user_id === editingId)?.role) {
        updatePayload.role = editForm.role;
      }
      if (
        editForm.status !== users.find((u) => u.user_id === editingId)?.status
      ) {
        updatePayload.status = editForm.status;
      }

      const res = await fetch(`http://localhost:3000/users/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) throw new Error('Failed to update user');
      const updatedUser = await res.json();

      // Update local state
      setUsers(users.map((u) => (u.user_id === editingId ? updatedUser : u)));
      setEditingId(null);

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users.filter((u) => u.user_id !== userId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    const roleMatch = !filterRole || user.role === filterRole;
    const statusMatch = !filterStatus || user.status === filterStatus;
    return roleMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="card">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>User Management</h3>

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: 12,
            padding: 8,
            backgroundColor: '#ffebee',
            borderRadius: 4,
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 4,
              fontSize: 12,
              color: '#666',
            }}
          >
            Filter by Role
          </label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 4px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            <option value="">All Roles</option>
            <option value="client">Client</option>
            <option value="trainer">Trainer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: 4,
              fontSize: 12,
              color: '#666',
            }}
          >
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 4px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12,
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #ddd',
              }}
            >
              <th style={{ padding: 8, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Username</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Phone</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Role</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Verified</th>
              <th style={{ padding: 8, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.user_id} style={{ borderBottom: '1px solid #eee' }}>
                {editingId === user.user_id ? (
                  <>
                    <td style={{ padding: 8 }}>{user.user_id}</td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: 4,
                          border: '1px solid #ddd',
                        }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: 4,
                          border: '1px solid #ddd',
                        }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: 4,
                          border: '1px solid #ddd',
                        }}
                      />
                    </td>
                    <td style={{ padding: 8 }}>
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: 4,
                          border: '1px solid #ddd',
                        }}
                      >
                        <option value="client">Client</option>
                        <option value="trainer">Trainer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: 8 }}>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        style={{
                          width: '100%',
                          padding: 4,
                          border: '1px solid #ddd',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned</option>
                      </select>
                    </td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          backgroundColor: editForm.email_verified
                            ? '#4CAF50'
                            : '#F44336',
                          color: 'white',
                          borderRadius: 2,
                          fontSize: 10,
                        }}
                      >
                        {editForm.email_verified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          marginRight: 4,
                          padding: '4px 8px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: 2,
                          cursor: 'pointer',
                          fontSize: 11,
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#999',
                          color: 'white',
                          border: 'none',
                          borderRadius: 2,
                          cursor: 'pointer',
                          fontSize: 11,
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: 8 }}>{user.user_id}</td>
                    <td style={{ padding: 8, fontWeight: 'bold' }}>
                      {user.username}
                    </td>
                    <td style={{ padding: 8 }}>{user.email}</td>
                    <td style={{ padding: 8 }}>{user.phone || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          backgroundColor:
                            user.role === 'admin'
                              ? '#F44336'
                              : user.role === 'manager'
                                ? '#2196F3'
                                : user.role === 'trainer'
                                  ? '#FF9800'
                                  : '#4CAF50',
                          color: 'white',
                          borderRadius: 2,
                          fontSize: 10,
                          fontWeight: 'bold',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          backgroundColor:
                            user.status === 'active' ? '#4CAF50' : '#F44336',
                          color: 'white',
                          borderRadius: 2,
                          fontSize: 10,
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          backgroundColor: user.email_verified
                            ? '#4CAF50'
                            : '#F44336',
                          color: 'white',
                          borderRadius: 2,
                          fontSize: 10,
                        }}
                      >
                        {user.email_verified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      {!readOnly && (
                        <>
                          <button
                            onClick={() => handleEdit(user)}
                            style={{
                              marginRight: 4,
                              padding: '4px 8px',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: 2,
                              cursor: 'pointer',
                              fontSize: 11,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.user_id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#F44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: 2,
                              cursor: 'pointer',
                              fontSize: 11,
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
