import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import HotelsPage from './pages/HotelsPage';
import PackagesPage from './pages/PackagesPage';
import DestinationDetail from './pages/DestinationDetail';
import HotelDetail from './pages/HotelDetail';
import PackageDetail from './pages/PackageDetail';
import MyTrips from './pages/MyTrips';
import { Page } from './types';

export interface NavState {
  page: Page;
  id?: string;
  bookingType?: 'hotel' | 'package';
}

export default function App() {
  const [nav, setNav] = useState<NavState>({ page: 'home' });

  const navigate = (state: NavState) => {
    setNav(state);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Navbar currentPage={nav.page} navigate={navigate} />
      <main>
        {nav.page === 'home' && <HomePage navigate={navigate} />}
        {nav.page === 'destinations' && <DestinationsPage navigate={navigate} />}
        {nav.page === 'hotels' && <HotelsPage navigate={navigate} />}
        {nav.page === 'packages' && <PackagesPage navigate={navigate} />}
        {nav.page === 'destination-detail' && nav.id && (
          <DestinationDetail id={nav.id} navigate={navigate} />
        )}
        {nav.page === 'hotel-detail' && nav.id && (
          <HotelDetail id={nav.id} navigate={navigate} />
        )}
        {nav.page === 'package-detail' && nav.id && (
          <PackageDetail id={nav.id} navigate={navigate} />
        )}
        {nav.page === 'my-trips' && <MyTrips navigate={navigate} />}
      </main>
    </div>
  );
}