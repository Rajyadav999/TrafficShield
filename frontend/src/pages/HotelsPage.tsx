import { useState, useEffect } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';
import { Hotel } from '../types';
import { HotelCard, LoadingGrid } from '../components/Cards';

interface Props { navigate: (s: NavState) => void; }

const CATEGORIES = ['All', 'Luxury', 'Heritage', 'Boutique', 'Resort'];

export default function HotelsPage({ navigate }: Props) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getHotels(undefined, category)
      .then(setHotels)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="page">
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400)' }}>
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>Find Your Perfect Stay</h1>
          <p>From heritage palaces to cozy boutiques</p>
        </div>
      </div>

      <div className="page-content">
        <div className="filters">
          <div className="filter-pills">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-pill ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? <LoadingGrid /> : (
          <div className="card-grid">
            {hotels.map(h => (
              <HotelCard key={h.id} hotel={h}
                onClick={() => navigate({ page: 'hotel-detail', id: h.id })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}