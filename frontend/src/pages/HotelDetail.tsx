import { useState, useEffect } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';
import { Hotel, HotelBookingForm } from '../types';
import { StarRating } from '../components/Cards';

interface Props { id: string; navigate: (s: NavState) => void; }

export default function HotelDetail({ id, navigate }: Props) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [form, setForm] = useState<HotelBookingForm>({
    hotel_id: id, guest_name: '', guest_email: '', guest_phone: '',
    check_in: '', check_out: '', rooms: 1, adults: 2, children: 0,password: '',
  });
  const [booking, setBooking] = useState<null | { id: string; total_amount: number }>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.getHotel(id).then(setHotel); }, [id]);

  const nights = form.check_in && form.check_out
    ? Math.max(0, (new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000)
    : 0;

  const total = hotel ? hotel.price_per_night * nights * form.rooms : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (nights <= 0) return setError('Please select valid check-in and check-out dates.');
    setSubmitting(true);
    try {
      const res = await api.bookHotel(form) as { booking: { id: string; total_amount: number } };
      setBooking(res.booking);
    } catch {
      setError('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hotel) return <div className="page-loading">Loading…</div>;

  if (booking) return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirm-icon">✅</div>
        <h2>Booking Confirmed!</h2>
        <p className="confirm-id">Booking ID: <strong>{booking.id}</strong></p>
        <div className="confirm-details">
          <p>🏨 <strong>{hotel.name}</strong></p>
          <p>📅 {form.check_in} → {form.check_out} ({nights} nights)</p>
          <p>💰 Total: <strong>₹{booking.total_amount.toLocaleString()}</strong></p>
        </div>
        <p className="confirm-email">Confirmation sent to <strong>{form.guest_email}</strong></p>
        <button className="btn-primary" onClick={() => navigate({ page: 'home' })}>Back to Home</button>
        <button className="btn-outline mt-sm" onClick={() => navigate({ page: 'my-trips' })}>View My Trips</button>
      </div>
    </div>
  );

  return (
    <div className="detail-page">
      <div className="detail-hero" style={{ backgroundImage: `url(${hotel.image})` }}>
        <div className="detail-hero-overlay" />
        <button className="back-btn" onClick={() => navigate({ page: 'hotels' })}>← Back</button>
        <div className="detail-hero-content">
          <span className="cat-tag">{hotel.category}</span>
          <h1>{hotel.name}</h1>
          <p>📍 {hotel.location}</p>
          <div className="detail-meta">
            <StarRating rating={hotel.rating} />
            <span>({hotel.reviews.toLocaleString()} reviews)</span>
            <span>₹{hotel.price_per_night.toLocaleString()}/night</span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <section className="detail-section">
            <h2>About This Property</h2>
            <p>{hotel.description}</p>
          </section>
          <section className="detail-section">
            <h2>Amenities</h2>
            <div className="amenity-list">
              {hotel.amenities.map(a => (
                <span key={a} className="amenity-item">✓ {a}</span>
              ))}
            </div>
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="sidebar-card booking-form-card">
            <h3>Book Your Stay</h3>
            <p className="price-display">₹{hotel.price_per_night.toLocaleString()} <small>per night</small></p>

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label>Full Name</label>
                <input required placeholder="Your name" value={form.guest_name}
                  onChange={e => setForm({...form, guest_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" placeholder="email@example.com" value={form.guest_email}
                  onChange={e => setForm({...form, guest_email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Booking Password</label>
                <input required type="password" placeholder="Set a password (min 6 characters)" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} />
                <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
                You'll need this to view your booking in My Trips
                </small>
            </div>
              <div className="form-group">
                <label>Phone</label>
                <input required placeholder="+91 98765 43210" value={form.guest_phone}
                  onChange={e => setForm({...form, guest_phone: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Check-in</label>
                  <input required type="date" min={new Date().toISOString().split('T')[0]}
                    value={form.check_in}
                    onChange={e => setForm({...form, check_in: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Check-out</label>
                  <input required type="date" min={form.check_in || new Date().toISOString().split('T')[0]}
                    value={form.check_out}
                    onChange={e => setForm({...form, check_out: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rooms</label>
                  <select value={form.rooms} onChange={e => setForm({...form, rooms: +e.target.value})}>
                    {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Adults</label>
                  <select value={form.adults} onChange={e => setForm({...form, adults: +e.target.value})}>
                    {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="price-breakdown">
                  <div className="pb-row"><span>₹{hotel.price_per_night.toLocaleString()} × {nights} nights × {form.rooms} room(s)</span></div>
                  <div className="pb-total"><span>Total</span><strong>₹{total.toLocaleString()}</strong></div>
                </div>
              )}

              {error && <div className="form-error">{error}</div>}
              <button className="btn-primary full-width" type="submit" disabled={submitting}>
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}