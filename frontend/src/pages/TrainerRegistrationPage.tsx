import React, { useEffect, useState } from 'react';
import { getJson, postJson } from '../api';
import '../styles.css';

interface TrainerProfile {
  trainer_id: number;
  user_id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  bio: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
}

export default function TrainerRegistrationPage() {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<TrainerProfile[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerProfile | null>(
    null,
  );
  const [showEditForm, setShowEditForm] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    specialty: 'yoga',
    phone: '',
    bio: '',
  });

  const specialties = [
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'strength_training', label: 'Strength Training' },
    { value: 'dance', label: 'Dance' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'stretching', label: 'Stretching' },
    { value: 'aerobics', label: 'Aerobics' },
  ];

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const data = await getJson('/trainers');
        setTrainers(data?.data || data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  useEffect(() => {
    let filtered = [...trainers];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.phone?.includes(searchQuery) ||
          t.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredTrainers(filtered);
  }, [trainers, searchQuery, statusFilter]);

  const handleRegisterTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create user account
      const userResponse = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'trainer',
          phone: formData.phone,
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to create user account');
      }

      const userData = await userResponse.json();
      const userId = userData.user?.user_id || userData.user_id;

      // Then create trainer profile
      const trainerResponse = await fetch('http://localhost:3000/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          user_id: userId,
          name: formData.name,
          specialty: formData.specialty,
          phone: formData.phone,
          email: formData.email,
          bio: formData.bio,
          status: 'active',
        }),
      });

      if (!trainerResponse.ok) {
        throw new Error('Failed to create trainer profile');
      }

      const newTrainer = await trainerResponse.json();
      setTrainers([...trainers, newTrainer]);
      setShowRegisterForm(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        name: '',
        specialty: 'yoga',
        phone: '',
        bio: '',
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateTrainer = async () => {
    if (!editingTrainer) return;

    try {
      const response = await fetch(
        `http://localhost:3000/trainers/${editingTrainer.trainer_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            name: editingTrainer.name,
            specialty: editingTrainer.specialty,
            phone: editingTrainer.phone,
            email: editingTrainer.email,
            bio: editingTrainer.bio,
            status: editingTrainer.status,
          }),
        },
      );

      if (!response.ok) throw new Error('Failed to update trainer');

      const updated = await response.json();
      setTrainers(
        trainers.map((t) =>
          t.trainer_id === updated.trainer_id ? updated : t,
        ),
      );
      setShowEditForm(false);
      setEditingTrainer(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading trainers...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⚡</div>
        <div>
          <div className="title">Trainer Registration & Management</div>
          <div className="muted">
            Register new trainers and manage their profiles
          </div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {error && (
          <div className="card" style={{ color: 'red', marginBottom: 20 }}>
            <p>Error: {error}</p>
          </div>
        )}

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
              Total Trainers
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {trainers.length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Active
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>
              {trainers.filter((t) => t.status === 'active').length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Inactive
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#FF9800' }}>
              {trainers.filter((t) => t.status === 'inactive').length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Pending
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#2196F3' }}>
              {trainers.filter((t) => t.status === 'pending').length}
            </div>
          </div>
        </div>

        {/* Register New Trainer Button */}
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          style={{
            padding: '12px 24px',
            marginBottom: 20,
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          {showRegisterForm ? '✕ Cancel' : '+ Register New Trainer'}
        </button>

        {/* Trainer Registration Form */}
        {showRegisterForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3>Register New Trainer</h3>
            <form onSubmit={handleRegisterTrainer}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 12,
                }}
              >
                {/* User Account Section */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <h4 style={{ marginBottom: 12 }}>User Account</h4>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="input"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input"
                    placeholder="trainer@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input"
                    placeholder="Enter password"
                  />
                </div>

                {/* Trainer Profile Section */}
                <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
                  <h4 style={{ marginBottom: 12 }}>Trainer Profile</h4>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input"
                    placeholder="Trainer's full name"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Specialty *
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                    className="input"
                  >
                    {specialties.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="input"
                    placeholder="Tell us about this trainer..."
                    rows={4}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                >
                  Register Trainer
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
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
            </form>
          </div>
        )}

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
                placeholder="Search by name, email, phone, or specialty"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
              />
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
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trainers Table */}
        <div className="card">
          <h3>Trainers List ({filteredTrainers.length})</h3>
          <div style={{ marginTop: 16, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Specialty
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Registered
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainers.map((trainer) => (
                  <tr
                    key={trainer.trainer_id}
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <td style={{ padding: '12px' }}>{trainer.name}</td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {trainer.email}
                    </td>
                    <td style={{ padding: '12px', fontSize: 12 }}>
                      {trainer.phone}
                    </td>
                    <td
                      style={{ padding: '12px', textTransform: 'capitalize' }}
                    >
                      {trainer.specialty.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor: getStatusColor(trainer.status),
                          color: 'white',
                          fontSize: 11,
                        }}
                      >
                        {trainer.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: 11 }}>
                      {new Date(trainer.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingTrainer(trainer);
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
            {filteredTrainers.length === 0 && (
              <p
                style={{ padding: '20px', textAlign: 'center', color: '#999' }}
              >
                No trainers found.
              </p>
            )}
          </div>
        </div>

        {/* Edit Trainer Form */}
        {showEditForm && editingTrainer && (
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
                maxWidth: 600,
                width: '90%',
              }}
            >
              <h3>Edit Trainer</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editingTrainer.name}
                  onChange={(e) =>
                    setEditingTrainer({
                      ...editingTrainer,
                      name: e.target.value,
                    })
                  }
                  className="input"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editingTrainer.email}
                  onChange={(e) =>
                    setEditingTrainer({
                      ...editingTrainer,
                      email: e.target.value,
                    })
                  }
                  className="input"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={editingTrainer.phone}
                  onChange={(e) =>
                    setEditingTrainer({
                      ...editingTrainer,
                      phone: e.target.value,
                    })
                  }
                  className="input"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Specialty
                </label>
                <select
                  value={editingTrainer.specialty}
                  onChange={(e) =>
                    setEditingTrainer({
                      ...editingTrainer,
                      specialty: e.target.value,
                    })
                  }
                  className="input"
                >
                  {specialties.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Bio</label>
                <textarea
                  value={editingTrainer.bio}
                  onChange={(e) =>
                    setEditingTrainer({
                      ...editingTrainer,
                      bio: e.target.value,
                    })
                  }
                  className="input"
                  rows={4}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={editingTrainer.status}
                  onChange={(e) =>
                    setEditingTrainer({
                      ...editingTrainer,
                      status: e.target.value as any,
                    })
                  }
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleUpdateTrainer}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingTrainer(null);
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
