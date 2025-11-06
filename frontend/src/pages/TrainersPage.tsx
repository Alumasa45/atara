import React, { useEffect, useState } from 'react';
import TrainerCard from '../components/TrainerCard';
import { getCurrentUserFromToken } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getCurrentUserFromToken();

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('http://localhost:3000/trainers', { headers });
        if (!res.ok) throw new Error('Failed to fetch trainers');

        const data = await res.json();
        // Handle both array and paginated response
        const trainerList = Array.isArray(data) ? data : data?.data || [];
        setTrainers(trainerList);
      } catch (err: any) {
        setError(err.message);
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="logo">👥</div>
        <div>
          <div className="title">Our Trainers</div>
          <div className="muted">Meet our professional fitness instructors</div>
        </div>
      </header>

      {loading && (
        <LoadingSpinner
          message="Loading trainers"
          subtitle="Fetching our professional instructors..."
          fullPage={false}
        />
      )}

      {error && (
        <div className="card" style={{ color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && trainers.length === 0 && (
        <div className="card">
          <p>No trainers available</p>
        </div>
      )}

      {!loading && !error && trainers.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            marginTop: 20,
          }}
        >
          {trainers.map((trainer: any) => (
            <div key={trainer.trainer_id} className="card">
              <TrainerCard
                name={trainer.name}
                specialty={trainer.specialty}
                phone={trainer.phone}
                email={trainer.email}
                bio={trainer.bio}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
