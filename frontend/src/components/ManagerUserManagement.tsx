import React, { useState, useEffect } from 'react';

interface User {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  loyalty_points: number;
  created_at: string;
}

interface ManagerUserManagementProps {
  onClose?: () => void;
}

export const ManagerUserManagement: React.FC<ManagerUserManagementProps> = ({
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({ role: '', status: '' });

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filterRole !== 'all' && { filter: filterRole }),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await fetch(`https://atara-dajy.onrender.com/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.data || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [filterRole]);

  const handleSearch = () => {
    fetchUsers(1);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await fetch(
        `https://atara-dajy.onrender.com/admin/users/${selectedUser.user_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!res.ok) throw new Error('Failed to update user');

      // Refresh the list
      await fetchUsers(currentPage);
      setShowUpdateModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (user: User) => {
    setSelectedUser(user);
    setUpdateData({ role: user.role, status: user.status });
    setShowUpdateModal(true);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3>👥 User Management</h3>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              ✕ Close
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: 1,
              minWidth: 200,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 13,
            }}
          />

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            <option value="all">All Roles</option>
            <option value="client">Client</option>
            <option value="trainer">Trainer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              padding: 12,
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Users Table */}
        {loading && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            Loading users...
          </div>
        )}

        {!loading && users.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999' }}>
            No users found
          </div>
        )}

        {!loading && users.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      Username
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      Loyalty Points
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.user_id}
                      style={{
                        borderBottom: '1px solid #eee',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                      }}
                    >
                      <td style={{ padding: 12 }}>
                        <strong>{user.username}</strong>
                      </td>
                      <td style={{ padding: 12 }}>{user.email}</td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            backgroundColor:
                              user.role === 'admin'
                                ? '#F3E5F5'
                                : user.role === 'manager'
                                  ? '#E3F2FD'
                                  : user.role === 'trainer'
                                    ? '#FFF3E0'
                                    : '#E8F5E9',
                            color:
                              user.role === 'admin'
                                ? '#7B1FA2'
                                : user.role === 'manager'
                                  ? '#1565C0'
                                  : user.role === 'trainer'
                                    ? '#E65100'
                                    : '#2E7D32',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 'bold',
                          }}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            backgroundColor:
                              user.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                            color:
                              user.status === 'active' ? '#2E7D32' : '#C62828',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 'bold',
                          }}
                        >
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <div
                          style={{
                            backgroundColor: '#E3F2FD',
                            color: '#1565C0',
                            padding: '8px 12px',
                            borderRadius: 4,
                            fontWeight: 'bold',
                            display: 'inline-block',
                          }}
                        >
                          ⭐ {user.loyalty_points}
                        </div>
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <button
                          onClick={() => openUpdateModal(user)}
                          style={{
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 'bold',
                          }}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <button
                onClick={() => fetchUsers(currentPage - 1)}
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
              <span
                style={{ alignSelf: 'center', color: '#666', fontSize: 12 }}
              >
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  cursor:
                    currentPage === totalPages ? 'not-allowed' : 'pointer',
                  backgroundColor:
                    currentPage === totalPages ? '#f5f5f5' : 'white',
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedUser && (
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
              width: '90%',
              maxWidth: 400,
              padding: 24,
            }}
          >
            <h3 style={{ marginBottom: 16 }}>
              Edit User - {selectedUser.username}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 4,
                  fontWeight: 'bold',
                  fontSize: 12,
                }}
              >
                Role
              </label>
              <select
                value={updateData.role}
                onChange={(e) =>
                  setUpdateData({ ...updateData, role: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                <option value="client">Client</option>
                <option value="trainer">Trainer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: 4,
                  fontWeight: 'bold',
                  fontSize: 12,
                }}
              >
                Status
              </label>
              <select
                value={updateData.status}
                onChange={(e) =>
                  setUpdateData({ ...updateData, status: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleUpdateUser}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Saving...' : '💾 Save'}
              </button>
              <button
                onClick={() => setShowUpdateModal(false)}
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
