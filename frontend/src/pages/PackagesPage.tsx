import { useState, useEffect } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';
import { Package } from '../types';
import { PackageCard, LoadingGrid } from '../components/Cards';

interface Props { navigate: (s: NavState) => void; }

export default function PackagesPage({ navigate }: Props) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPackages().then(setPackages).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1400)' }}>
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <h1>Holiday Packages</h1>
          <p>All-inclusive getaways — just pack your bags</p>
        </div>
      </div>

      <div className="page-content">
        {loading ? <LoadingGrid /> : (
          <div className="card-grid">
            {packages.map(p => (
              <PackageCard key={p.id} pkg={p}
                onClick={() => navigate({ page: 'package-detail', id: p.id })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}