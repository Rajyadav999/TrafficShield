import { useState } from 'react';
import { NavState } from '../App';
import { Page } from '../types';

interface Props {
  currentPage: Page;
  navigate: (state: NavState) => void;
}

const links: { label: string; page: Page }[] = [
  { label: 'Destinations', page: 'destinations' },
  { label: 'Hotels', page: 'hotels' },
  { label: 'Packages', page: 'packages' },
  { label: 'My Trips', page: 'my-trips' },
];

export default function Navbar({ currentPage, navigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="brand" onClick={() => navigate({ page: 'home' })}>
          <span className="brand-icon">✈</span>
          <span className="brand-text">WanderLust</span>
        </button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <button
              key={l.page}
              className={`nav-link ${currentPage === l.page ? 'active' : ''}`}
              onClick={() => { navigate({ page: l.page }); setMenuOpen(false); }}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}