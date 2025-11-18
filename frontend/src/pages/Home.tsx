import React, { useEffect, useState } from 'react';
import TrainerCard from '../components/TrainerCard';
import SessionCard from '../components/SessionCard';
import BookingFlow from '../components/BookingFlow';
import MembershipCard from '../components/MembershipCard';
import NavigationHeader from '../components/NavigationHeader';
import api from '../api';

export default function Home() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [showFlow, setShowFlow] = useState(false);
  const [initialSessionId, setInitialSessionId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hardcoded images from public/images folder
  const backgroundImages = [
    '/images/73208.jpg',
    '/images/73210.jpg',
    '/images/73212.jpg',
    '/images/73214.jpg',
    '/images/73216.jpg',
    '/images/Everyday is Pilates day_ Come for Mat or Reformer….jpg',
  ];

  // Auto-transition background every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  useEffect(() => {
    // Fetch all trainers
    api
      .fetchTrainers()
      .then((t: any) => {
        console.log('Trainers API response:', t);
        const trainersList = Array.isArray(t) ? t : t?.data || [];
        console.log('Processed trainers list:', trainersList);
        setTrainers(trainersList);
      })
      .catch((error) => {
        console.error('Failed to fetch trainers:', error);
        setTrainers([]);
      });
    
    // Fetch schedules for upcoming sessions (schedules have dates, not sessions)
    api
      .fetchSchedules()
      .then((scheduleData: any) => {
        const allSchedules = Array.isArray(scheduleData) ? scheduleData : scheduleData?.data || [];
        
        // Filter for upcoming schedules only
        const now = new Date();
        const upcomingSchedules = allSchedules.filter((schedule: any) => {
          if (schedule.date) {
            const scheduleDate = new Date(schedule.date);
            return scheduleDate >= now;
          }
          return false;
        });
        
        // Extract unique sessions from upcoming schedules
        const sessionMap = new Map();
        upcomingSchedules.forEach((schedule: any) => {
          if (schedule.session) {
            sessionMap.set(schedule.session.session_id, schedule.session);
          }
          // Also check timeSlots for sessions
          if (schedule.timeSlots) {
            schedule.timeSlots.forEach((slot: any) => {
              if (slot.session) {
                sessionMap.set(slot.session.session_id, slot.session);
              }
            });
          }
        });
        
        const uniqueUpcomingSessions = Array.from(sessionMap.values());
        setUpcomingSessions(uniqueUpcomingSessions);
      })
      .catch(() => {
        setUpcomingSessions([]);
      });
  }, []);

  return (
    <div
      className="app"
      style={{
        backgroundImage: `url('${backgroundImages[currentImageIndex]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        transition: 'background-image 1s ease-in-out',
        minHeight: '100vh',
      }}
    >
      {/* Navigation Header */}
      <NavigationHeader />

      {/* Dark overlay for content readability */}
      <div
        style={{
          position: 'fixed',
          top: 72,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <div
        className="home-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 16,
          marginTop: 92,
          position: 'relative',
          zIndex: 10,
          padding: '0 20px',
          maxWidth: '1200px',
          margin: '92px auto 0',
        }}
      >
        <div>
          <div className="card">
            <h3>Upcoming Sessions</h3>
            {upcomingSessions.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No upcoming sessions available</p>
            ) : (
              upcomingSessions.slice(0, 3).map((s: any) => (
                <SessionCard
                  key={s.session_id}
                  sessionId={s.session_id}
                  description={s.description}
                  category={s.category}
                  duration={s.duration_minutes}
                  price={Number(s.price)}
                />
              ))
            )}
          </div>

          <div style={{ height: 16 }} />

          <MembershipCard />

          <div style={{ height: 16 }} />

          <div className="card">
            <h3>Trainers</h3>
            {trainers.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No trainers available</p>
            ) : (
              trainers.slice(0, 4).map((t: any) => (
                <TrainerCard
                  key={t.trainer_id}
                  name={t.name}
                  specialty={t.specialty}
                  phone={t.phone}
                  email={t.email}
                  bio={t.bio}
                />
              ))
            )}
          </div>
        </div>

        <aside>
          <div className="card">
            <h3>Book a Class</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>Ready to join a session? Click below to start booking.</p>
            <button className="button" onClick={() => setShowFlow(true)}>
              Book Now
            </button>
            {showFlow && (
              <div className="modal-overlay" onClick={() => setShowFlow(false)}>
                <div
                  className="modal"
                  onClick={(e) => (e as any).stopPropagation()}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Book a class</h3>
                    <button
                      className="close"
                      onClick={() => setShowFlow(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <BookingFlow
                      initialSessionId={initialSessionId ?? undefined}
                      onDone={() => {
                        setShowFlow(false);
                        setInitialSessionId(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
