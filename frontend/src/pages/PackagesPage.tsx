import { useState, useEffect } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';
import { Package, PackageBookingForm } from '../types';
import { StarRating } from '../components/Cards';

interface Props { id: string; navigate: (s: NavState) => void; }

export default function PackageDetail({ id, navigate }: Props) {
  const [pkg, setPkg] = useState<Package | null>(null);
  const [form, setForm] = useState<PackageBookingForm>({
    package_id: id, traveler_name: '', traveler_email: '', traveler_phone: '',
    travel_date: '', adults: 2, children: 0,password: '',
  });
  const [booking, setBooking] = useState<null | { id: string; total_amount: number }>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.getPackage(id).then(setPkg); }, [id]);

  const total = pkg ? pkg.price * (form.adults + form.children * 0.5) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.bookPackage(form) as { booking: { id: string; total_amount: number } };
      setBooking(res.booking);
    } catch {
      setError('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!pkg) return <div className="page-loading">Loading…</div>;

  if (booking) return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirm-icon">🎉</div>
        <h2>Package Booked!</h2>
        <p className="confirm-id">Booking ID: <strong>{booking.id}</strong></p>
        <div className="confirm-details">
          <p>🏝️ <strong>{pkg.title}</strong></p>
          <p>📅 Travel Date: {form.travel_date}</p>
          <p>👥 {form.adults} Adults, {form.children} Children</p>
          <p>💰 Total: <strong>₹{booking.total_amount.toLocaleString()}</strong></p>
        </div>
        <p className="confirm-email">Itinerary sent to <strong>{form.traveler_email}</strong></p>
        <button className="btn-primary" onClick={() => navigate({ page: 'home' })}>Back to Home</button>
        <button className="btn-outline mt-sm" onClick={() => navigate({ page: 'my-trips' })}>View My Trips</button>
      </div>
    </div>
  );

  return (
    <div className="detail-page">
      <div className="detail-hero" style={{ backgroundImage: `url(${pkg.image})` }}>
        <div className="detail-hero-overlay" />
        <button className="back-btn" onClick={() => navigate({ page: 'packages' })}>← Back</button>
        <div className="detail-hero-content">
          <span className="cat-tag">{pkg.duration}</span>
          <h1>{pkg.title}</h1>
          <p>📍 {pkg.destinations.join(' · ')}</p>
          <div className="detail-meta">
            <StarRating rating={pkg.rating} />
            <span>({pkg.reviews.toLocaleString()} reviews)</span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <section className="detail-section">
            <h2>Package Highlights</h2>
            <div className="highlight-grid">
              {pkg.highlights.map(h => <div key={h} className="highlight-item"><span className="hl-dot">✦</span> {h}</div>)}
            </div>
          </section>
          <section className="detail-section">
            <h2>What's Included</h2>
            <div className="amenity-list">
              {pkg.includes.map(i => <span key={i} className="amenity-item">✓ {i}</span>)}
            </div>
          </section>
          <section className="detail-section">
            <h2>Destinations Covered</h2>
            <div className="dest-tags">
              {pkg.destinations.map(d => <span key={d} className="dest-tag">{d}</span>)}
            </div>
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="sidebar-card booking-form-card">
            <h3>Book This Package</h3>
            <p className="price-display">₹{pkg.price.toLocaleString()} <small>per person</small></p>

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label>Full Name</label>
                <input required placeholder="Your name" value={form.traveler_name}
                  onChange={e => setForm({...form, traveler_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" placeholder="email@example.com" value={form.traveler_email}
                  onChange={e => setForm({...form, traveler_email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Booking Password</label>
                <input  required  type="password" placeholder="Set a password (min 6 characters)" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}/>
                <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>
                You'll need this to view your booking in My Trips
                </small>
             </div>
              <div className="form-group">
                <label>Phone</label>
                <input required placeholder="+91 98765 43210" value={form.traveler_phone}
                  onChange={e => setForm({...form, traveler_phone: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Travel Date</label>
                <input required type="date" min={new Date().toISOString().split('T')[0]}
                  value={form.travel_date}
                  onChange={e => setForm({...form, travel_date: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Adults</label>
                  <select value={form.adults} onChange={e => setForm({...form, adults: +e.target.value})}>
                    {[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Children</label>
                  <select value={form.children} onChange={e => setForm({...form, children: +e.target.value})}>
                    {[0,1,2,3,4].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="price-breakdown">
                <div className="pb-row"><span>{form.adults} adults × ₹{pkg.price.toLocaleString()}</span></div>
                {form.children > 0 && <div className="pb-row"><span>{form.children} children × ₹{(pkg.price * 0.5).toLocaleString()}</span></div>}
                <div className="pb-total"><span>Total</span><strong>₹{total.toLocaleString()}</strong></div>
              </div>

              {error && <div className="form-error">{error}</div>}
              <button className="btn-primary full-width" type="submit" disabled={submitting}>
                {submitting ? 'Booking…' : 'Book Now'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}