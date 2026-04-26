import { useState, useEffect } from 'react';
import { NavState } from '../App';
import { api } from '../services/api';
import { Destination, Package } from '../types';
import { DestinationCard, PackageCard } from '../components/Cards';

const HERO_SLIDES = [
  { bg: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400', title: 'Discover India', sub: 'A billion experiences await' },
  { bg: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1400', title: 'God\'s Own Country', sub: 'Kerala — where nature breathes' },
  { bg: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1400', title: 'Touch the Sky', sub: 'Himalayan adventures call you' },
];

interface Props { navigate: (s: NavState) => void; }

export default function HomePage({ navigate }: Props) {
  const [slide, setSlide] = useState(0);
  const [search, setSearch] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeTab, setActiveTab] = useState<'hotels'|'packages'>('hotels');

  useEffect(() => {
    api.getDestinations().then(setDestinations);
    api.getPackages().then(setPackages);
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate({ page: 'destinations' });
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className={`hero-slide ${i === slide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${s.bg})` }} />
        ))}
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-eyebrow">EXPLORE THE WORLD</p>
          <h1 className="hero-title">{HERO_SLIDES[slide].title}</h1>
          <p className="hero-sub">{HERO_SLIDES[slide].sub}</p>

          {/* Search bar */}
          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-tabs">
              {(['hotels','packages'] as const).map(t => (
                <button key={t} type="button"
                  className={`stab ${activeTab === t ? 'active' : ''}`}
                  onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="search-row">
              <input
                className="search-input"
                placeholder={activeTab === 'hotels' ? 'Search destinations, hotels…' : 'Search holiday packages…'}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="search-btn" type="submit">Search</button>
            </div>
          </form>
        </div>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        {[
          { num: '500+', label: 'Destinations' },
          { num: '10K+', label: 'Hotels' },
          { num: '2M+', label: 'Happy Travelers' },
          { num: '24/7', label: 'Support' },
        ].map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-num">{s.num}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Explore by Category</h2>
          <p>Find your perfect travel style</p>
        </div>
        <div className="category-grid">
          {[
            { icon: '🏖️', label: 'Beach', color: '#0ea5e9' },
            { icon: '🏔️', label: 'Mountains', color: '#10b981' },
            { icon: '🏰', label: 'Heritage', color: '#f59e0b' },
            { icon: '🌿', label: 'Nature', color: '#22c55e' },
            { icon: '🎭', label: 'Culture', color: '#a855f7' },
            { icon: '🏙️', label: 'City', color: '#ef4444' },
          ].map(c => (
            <button key={c.label} className="cat-btn"
              style={{ '--cat-color': c.color } as React.CSSProperties}
              onClick={() => navigate({ page: 'destinations' })}>
              <span className="cat-icon">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Top Destinations */}
      <section className="section alt-bg">
        <div className="section-header">
          <h2>Top Destinations</h2>
          <p>Handpicked places loved by millions</p>
        </div>
        <div className="card-grid">
          {destinations.slice(0, 3).map(d => (
            <DestinationCard key={d.id} dest={d} onClick={() => navigate({ page: 'destination-detail', id: d.id })} />
          ))}
        </div>
        <div className="center-btn">
          <button className="btn-outline" onClick={() => navigate({ page: 'destinations' })}>View All Destinations →</button>
        </div>
      </section>

      {/* Packages */}
      <section className="section">
        <div className="section-header">
          <h2>Holiday Packages</h2>
          <p>All-inclusive deals curated for you</p>
        </div>
        <div className="card-grid">
          {packages.slice(0, 3).map(p => (
            <PackageCard key={p.id} pkg={p} onClick={() => navigate({ page: 'package-detail', id: p.id })} />
          ))}
        </div>
        <div className="center-btn">
          <button className="btn-outline" onClick={() => navigate({ page: 'packages' })}>Explore All Packages →</button>
        </div>
      </section>

      {/* Why Us */}
      <section className="section why-section">
        <div className="section-header">
          <h2>Why WanderLust?</h2>
        </div>
        <div className="why-grid">
          {[
            { icon: '🛡️', title: 'Safe & Secure', desc: '100% secure payments and verified listings' },
            { icon: '💰', title: 'Best Price Guarantee', desc: 'Find a lower price? We\'ll match it.' },
            { icon: '🎯', title: 'Expert Curated', desc: 'Hand-picked by our travel experts' },
            { icon: '📱', title: '24/7 Support', desc: 'Always there when you need us' },
          ].map(w => (
            <div key={w.title} className="why-card">
              <span className="why-icon">{w.icon}</span>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-icon">✈</span> WanderLust
            <p>Your trusted travel companion since 2020</p>
          </div>
          <div className="footer-links">
            <div><strong>Company</strong><a>About Us</a><a>Careers</a><a>Blog</a></div>
            <div><strong>Support</strong><a>Help Center</a><a>Contact</a><a>Cancellation</a></div>
            <div><strong>Legal</strong><a>Privacy</a><a>Terms</a><a>Cookies</a></div>
          </div>
        </div>
        <div className="footer-bottom">© 2025 WanderLust. All rights reserved.</div>
      </footer>
    </div>
  );
}