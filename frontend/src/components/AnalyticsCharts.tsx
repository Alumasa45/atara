import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface LineChartProps {
  data: Array<{
    date: string;
    bookings: number;
    sessions: number;
    users: number;
  }>;
}

interface BarChartProps {
  data: Array<{
    date: string;
    newUsers: number;
  }>;
}

/**
 * System Analysis Line Chart
 * Shows trends over time for bookings, sessions, and active users
 */
export const SystemAnalysisChart: React.FC<LineChartProps> = ({ data }) => {
  const colors = ['#2196F3', '#4CAF50', '#FF9800'];

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>
          📊 System Analysis - Monthly Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#999" style={{ fontSize: 12 }} />
            <YAxis stroke="#999" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 4,
              }}
              cursor={{ stroke: '#ccc', strokeWidth: 1 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bookings"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], r: 4 }}
              activeDot={{ r: 6 }}
              name="Active Bookings"
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke={colors[1]}
              strokeWidth={2}
              dot={{ fill: colors[1], r: 4 }}
              activeDot={{ r: 6 }}
              name="Sessions Completed"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke={colors[2]}
              strokeWidth={2}
              dot={{ fill: colors[2], r: 4 }}
              activeDot={{ r: 6 }}
              name="Active Users"
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
          <p>
            📈 <strong>Key Metrics:</strong> Track daily trends of bookings,
            completed sessions, and active users to monitor studio performance.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * User Intake Bar Chart
 * Shows new user registrations per day
 */
export const UserIntakeChart: React.FC<BarChartProps> = ({ data }) => {
  const colors = ['#1976D2', '#1565C0', '#0D47A1', '#0D47A1', '#1565C0'];

  return (
    <div style={{ marginBottom: 24 }}>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>
          👥 User Intake - Daily Registrations
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" stroke="#999" style={{ fontSize: 12 }} />
            <YAxis stroke="#999" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: 4,
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              formatter={(value) => [value, 'New Users']}
            />
            <Bar dataKey="newUsers" name="New Users" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
          <p>
            👤 <strong>New Registrations:</strong> Monitor daily user sign-ups
            to identify peak registration periods and campaign effectiveness.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Monthly Analysis Summary Card
 */
export interface MonthlyAnalysis {
  month: string;
  year: number;
  totalNewUsers: number;
  totalBookings: number;
  completedSessions: number;
  totalLoyaltyPointsAwarded: number;
  averageBookingPerUser: number;
  topTrainer: string;
  systemHealthScore: number;
  avgSessionCompletion: number;
  peakBookingTime: string;
}

export const MonthlyAnalysisCard: React.FC<{ data: MonthlyAnalysis }> = ({
  data,
}) => {
  const scoreColor =
    data.systemHealthScore >= 80
      ? '#4CAF50'
      : data.systemHealthScore >= 60
        ? '#FF9800'
        : '#F44336';

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0, marginBottom: 4, fontSize: 24 }}>
              📋 {data.month} {data.year} - Monthly Analysis
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: 13 }}>
              Studio performance summary and insights
            </p>
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: scoreColor,
              textAlign: 'center',
              minWidth: 80,
            }}
          >
            {data.systemHealthScore}%
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
            marginTop: 20,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
              New Users
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {data.totalNewUsers}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
              Total Bookings
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {data.totalBookings}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
              Completed Sessions
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {data.completedSessions}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
              Loyalty Points Awarded
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {data.totalLoyaltyPointsAwarded}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
              Avg Booking/User
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {data.averageBookingPerUser.toFixed(1)}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: 12,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>
              Completion Rate
            </div>
            <div style={{ fontSize: 28, fontWeight: 'bold' }}>
              {data.avgSessionCompletion}%
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8 }}>
              🏆 Top Trainer
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.15)',
                padding: '8px 12px',
                borderRadius: 4,
              }}
            >
              {data.topTrainer}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8 }}>
              ⏰ Peak Booking Time
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.15)',
                padding: '8px 12px',
                borderRadius: 4,
              }}
            >
              {data.peakBookingTime}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <strong>📊 Insights & Recommendations:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
            <li>
              {data.systemHealthScore >= 80
                ? '✨ Excellent performance! Continue current strategy.'
                : data.systemHealthScore >= 60
                  ? '⚠️ Good performance. Consider optimizing peak hours.'
                  : '⚡ Focus on improving user retention and session completion rates.'}
            </li>
            <li>
              {data.totalNewUsers > 50
                ? '🚀 Strong user acquisition! Marketing campaigns are effective.'
                : '📈 Increase marketing efforts to boost user registration.'}
            </li>
            <li>
              {data.avgSessionCompletion >= 80
                ? '👍 High session completion rate! User satisfaction is strong.'
                : '🔄 Improve session scheduling and trainer allocation.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Demo function to generate sample data
 */
export const generateSampleChartData = () => {
  // Sample monthly trend data
  const trendData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    bookings: Math.floor(Math.random() * 50 + 30),
    sessions: Math.floor(Math.random() * 40 + 20),
    users: Math.floor(Math.random() * 100 + 50),
  }));

  // Sample user intake data
  const intakeData = Array.from({ length: 30 }, (_, i) => ({
    date: `D${i + 1}`,
    newUsers: Math.floor(Math.random() * 20 + 5),
  }));

  // Sample monthly analysis
  const monthlyAnalysis: MonthlyAnalysis = {
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    totalNewUsers: 487,
    totalBookings: 1203,
    completedSessions: 892,
    totalLoyaltyPointsAwarded: 8920,
    averageBookingPerUser: 2.47,
    topTrainer: 'Ahmed Hassan',
    systemHealthScore: 85,
    avgSessionCompletion: 85,
    peakBookingTime: '6:00 PM - 8:00 PM',
  };

  return { trendData, intakeData, monthlyAnalysis };
};
