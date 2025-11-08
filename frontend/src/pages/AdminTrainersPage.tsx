import React, { useEffect, useState } from 'react';
import { getJson } from '../api';
import '../styles.css';

const BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'https://atara-dajy.onrender.com';

interface Trainer {
  trainer_id: number;
  user_id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  bio: string;
  status: string;
}

interface AdminDashboardData {
  summary: {
    totalUsers: number;
    totalBookings: number;
    totalSessions: number;
    totalTrainers: number;
    totalCancellations: number;
    totalSchedules: number;
  };
  usersByRole: {
    clients: number;
    trainers: number;
    managers: number;
    admins: number;
  };
}

export default function AdminTrainersPage() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'yoga',
    phone: '',
    email: '',
    bio: '',
    status: 'active',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getJson('/dashboard/admin');
        setDashboardData(data);

        // Fetch trainers list from admin endpoint with pagination
        const params = new URLSearchParams({
          page: '1',
          limit: '100',
        });
        const trainersData = await getJson(
          `/admin/trainers?${params.toString()}`,
        );
        console.log('Trainers response:', trainersData);
        setTrainers(trainersData?.data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching trainers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE}/trainers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create trainer');

      const newTrainer = await response.json();
      setTrainers([...trainers, newTrainer]);
      setShowCreateForm(false);
      setFormData({
        name: '',
        specialty: 'yoga',
        phone: '',
        email: '',
        bio: '',
        status: 'active',
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading...</p>
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

  const activeTrainers = trainers.filter((t) => t.status === 'active').length;
  const totalTrainers = trainers.length;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⚡</div>
        <div>
          <div className="title">Trainer Management</div>
          <div className="muted">
            Manage your trainers and their specialties
          </div>
        </div>
      </header>

      <div style={{ marginTop: 20 }}>
        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Total Trainers
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>
              {totalTrainers}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Active Trainers
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#4CAF50' }}>
              {activeTrainers}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              Inactive Trainers
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#FFC107' }}>
              {totalTrainers - activeTrainers}
            </div>
          </div>
        </div>

        {/* Create Trainer Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '12px 24px',
            marginBottom: 20,
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Trainer'}
        </button>

        {/* Create Trainer Form */}
        {showCreateForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3>Create New Trainer</h3>
            <form onSubmit={handleCreateTrainer}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  placeholder="Trainer name"
                />
              </div>

              <div style={{ marginBottom: 12 }}>
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

              <div style={{ marginBottom: 12 }}>
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
                  placeholder="1234567890"
                />
              </div>

              <div style={{ marginBottom: 12 }}>
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
                  <option value="yoga">Yoga</option>
                  <option value="pilates">Pilates</option>
                  <option value="strength_training">Strength Training</option>
                  <option value="dance">Dance</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="input"
                  placeholder="Trainer bio (optional)"
                  rows={4}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Create Trainer
              </button>
            </form>
          </div>
        )}

        {/* Trainers List */}
        <div className="card">
          <h3>Trainer List</h3>
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
                  <th style={{ padding: '12px', textAlign: 'left' }}>
                    Specialty
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr
                    key={trainer.trainer_id}
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <td style={{ padding: '12px' }}>{trainer.name}</td>
                    <td
                      style={{ padding: '12px', textTransform: 'capitalize' }}
                    >
                      {trainer.specialty.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '12px' }}>{trainer.email}</td>
                    <td style={{ padding: '12px' }}>{trainer.phone}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor:
                            trainer.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                          color:
                            trainer.status === 'active' ? '#2E7D32' : '#C62828',
                          fontSize: 12,
                        }}
                      >
                        {trainer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trainers.length === 0 && (
              <p
                style={{ padding: '20px', textAlign: 'center', color: '#999' }}
              >
                No trainers found. Create one to get started!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
