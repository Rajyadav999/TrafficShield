import { Destination, Hotel, Package, HotelBookingForm, PackageBookingForm } from '../types';

const BASE = 'http://localhost:8000';  

const get = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

const post = async <T>(path: string, body: unknown): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

export const api = {
  getDestinations: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (search) params.set('search', search);
    const q = params.toString();
    return get<Destination[]>(`/destinations${q ? '?' + q : ''}`);
  },
  getDestination: (id: string) => get<Destination>(`/destinations/${id}`),
  getHotels: (destinationId?: string, category?: string) => {
    const params = new URLSearchParams();
    if (destinationId) params.set('destination_id', destinationId);
    if (category && category !== 'All') params.set('category', category);
    const q = params.toString();
    return get<Hotel[]>(`/hotels${q ? '?' + q : ''}`);
  },
  getHotel: (id: string) => get<Hotel>(`/hotels/${id}`),
  getPackages: () => get<Package[]>('/packages'),
  getPackage: (id: string) => get<Package>(`/packages/${id}`),
  bookHotel: (form: HotelBookingForm) => post('/bookings/hotel', form),
  bookPackage: (form: PackageBookingForm) => post('/bookings/package', form),

  // ← UPDATED: now POST with email + password instead of GET
  getMyTrips: (email: string, password: string) =>
    post<unknown[]>('/bookings/view', { email, password }),

  search: (q: string) =>
    get<{ destinations: Destination[]; hotels: Hotel[]; packages: Package[] }>(
      `/search?q=${encodeURIComponent(q)}`
    ),
};