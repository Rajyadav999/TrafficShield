import { useState } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';

interface Props { navigate: (s: NavState) => void; }

export default function MyTrips({ navigate }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trips, setTrips] = useState<unknown[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrips = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyTrips(email, password);
      setTrips(data as unknown[]);
      setSearched(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          setError('Incorrect password. Please try again.');
        } else if (err.message.includes('404')) {
          setError('No bookings found for this email.');
        } else {
          setError('Something went wrong. Please try again.');
        }
      }
      setTrips([]);
      setSearched(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400)' }}>
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>My Trips</h1>
          <p>View all your upcoming and past bookings</p>
        </div>
      </div>

      <div className="page-content">
        <div className="trips-lookup">
          <h2>Find Your Bookings</h2>
          <form className="lookup-form" onSubmit={fetchTrips}>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Booking Password</label>
              <input
                type="password"
                required
                placeholder="Enter your booking password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
                This is the password you set when you made your booking
              </small>
            </div>

            {error && (
              <div className="form-error" style={{ color: 'red', marginBottom: '10px' }}>
                {error}
              </div>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Searching…' : 'Find Bookings'}
            </button>
          </form>
        </div>

        {searched && (
          trips.length === 0
            ? (
              <div className="empty-trips">
                <div className="empty-icon">🧳</div>
                <h3>No bookings found</h3>
                <p>No bookings found for <strong>{email}</strong></p>
                <button className="btn-primary" onClick={() => navigate({ page: 'destinations' })}>
                  Start Exploring
                </button>
              </div>
            )
            : (
              <div className="trips-list">
                <h3>{trips.length} booking(s) found</h3>
                {(trips as Record<string, unknown>[]).map((t) => (
                  <div key={t.id as string} className="trip-card">
                    <div className="trip-header">
                      <span className="trip-id">#{t.id as string}</span>
                      <span className={`trip-status ${(t.status as string).toLowerCase()}`}>
                        {t.status as string}
                      </span>
                    </div>
                    <div className="trip-body">
                      {t.type === 'hotel' ? (
                        <>
                          <h4>🏨 {(t.hotel as Record<string, string>).name}</h4>
                          <p>📍 {(t.hotel as Record<string, string>).location}</p>
                          <p>📅 {t.check_in as string} → {t.check_out as string} ({t.nights as number} nights)</p>
                          <p>👤 {t.guest_name as string} · {t.adults as number} adults</p>
                        </>
                      ) : (
                        <>
                          <h4>🏝️ {(t.package as Record<string, string>).title}</h4>
                          <p>📍 {((t.package as Record<string, string[]>).destinations as string[]).join(' · ')}</p>
                          <p>📅 Travel Date: {t.travel_date as string}</p>
                          <p>👤 {t.traveler_name as string} · {t.adults as number} adults</p>
                        </>
                      )}
                      <p className="trip-total">
                        Total Paid: <strong>₹{(t.total_amount as number).toLocaleString()}</strong>
                      </p>
                    </div>
                    <div className="trip-footer">
                      <small>Booked on {new Date(t.booked_at as string).toLocaleDateString('en-IN', { dateStyle: 'long' })}</small>
                    </div>
                  </div>
                ))}
              </div>
            )
        )}
      </div>
    </div>
  );
}