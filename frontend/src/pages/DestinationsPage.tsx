import { useState, useEffect } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';
import { Destination } from '../types';
import { DestinationCard, LoadingGrid } from '../components/Cards';

interface Props { navigate: (s: NavState) => void; }

const CATEGORIES = ['All', 'Beach', 'Mountains', 'Heritage', 'Nature'];

export default function DestinationsPage({ navigate }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDestinations(category, search)
      .then(setDestinations)
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="page">
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400)' }}>
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>Explore Destinations</h1>
          <p>Discover India's most magnificent places</p>
        </div>
      </div>

      <div className="page-content">
        {/* Filters */}
        <div className="filters">
          <input className="filter-search" placeholder="🔍 Search destinations…" value={search}
            onChange={e => setSearch(e.target.value)} />
          <div className="filter-pills">
            {CATEGORIES.map(c => (
              <button key={c} className={`filter-pill ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? <LoadingGrid /> : (
          destinations.length === 0
            ? <div className="empty-state">No destinations found 🗺️</div>
            : <div className="card-grid">
                {destinations.map(d => (
                  <DestinationCard key={d.id} dest={d}
                    onClick={() => navigate({ page: 'destination-detail', id: d.id })} />
                ))}
              </div>
        )}
      </div>
    </div>
  );
}