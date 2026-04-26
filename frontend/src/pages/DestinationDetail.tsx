import { useState, useEffect } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';
import { Destination, Hotel } from '../types';
import { HotelCard } from '../components/Cards';

interface Props { id: string; navigate: (s: NavState) => void; }

export default function DestinationDetail({ id, navigate }: Props) {
  const [dest, setDest] = useState<Destination | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    api.getDestination(id).then(setDest);
    api.getHotels(id).then(setHotels);
  }, [id]);

  if (!dest) return <div className="page-loading">Loading…</div>;

  return (
    <div className="detail-page">
      <div className="detail-hero" style={{ backgroundImage: `url(${dest.image})` }}>
        <div className="detail-hero-overlay" />
        <button className="back-btn" onClick={() => navigate({ page: 'destinations' })}>← Back</button>
        <div className="detail-hero-content">
          <span className="cat-tag">{dest.category}</span>
          <h1>{dest.name}</h1>
          <p>{dest.country}</p>
          <div className="detail-meta">
            <span>⭐ {dest.rating} ({dest.reviews.toLocaleString()} reviews)</span>
            <span>📅 Best time: {dest.best_time}</span>
            <span>💰 From ₹{dest.avg_budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <section className="detail-section">
            <h2>About {dest.name}</h2>
            <p className="detail-desc">{dest.description}</p>
          </section>

          <section className="detail-section">
            <h2>Highlights</h2>
            <div className="highlight-grid">
              {dest.highlights.map(h => (
                <div key={h} className="highlight-item">
                  <span className="hl-dot">✦</span> {h}
                </div>
              ))}
            </div>
          </section>

          {hotels.length > 0 && (
            <section className="detail-section">
              <h2>Hotels in {dest.name}</h2>
              <div className="card-grid sm">
                {hotels.map(h => (
                  <HotelCard key={h.id} hotel={h}
                    onClick={() => navigate({ page: 'hotel-detail', id: h.id })} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Quick Info</h3>
            <div className="info-row"><span>📍 Location</span><strong>{dest.name}, {dest.country}</strong></div>
            <div className="info-row"><span>📅 Best Time</span><strong>{dest.best_time}</strong></div>
            <div className="info-row"><span>💰 Avg Budget</span><strong>₹{dest.avg_budget.toLocaleString()}</strong></div>
            <div className="info-row"><span>⭐ Rating</span><strong>{dest.rating}/5</strong></div>
            <button className="btn-primary full-width"
              onClick={() => navigate({ page: 'hotels' })}>
              Browse Hotels Here
            </button>
            <button className="btn-outline full-width mt-sm"
              onClick={() => navigate({ page: 'packages' })}>
              View Packages
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}