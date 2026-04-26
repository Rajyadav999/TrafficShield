export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  highlights: string[];
  best_time: string;
  avg_budget: number;
}

export interface Hotel {
  id: string;
  destination_id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  price_per_night: number;
  category: string;
  amenities: string[];
  description: string;
  location: string;
}

export interface Package {
  id: string;
  title: string;
  destinations: string[];
  duration: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  includes: string[];
  highlights: string[];
}

export interface HotelBookingForm {
  hotel_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  rooms: number;
  adults: number;
  children: number;
  special_requests?: string;
  password: string;
}

export interface PackageBookingForm {
  package_id: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  travel_date: string;
  adults: number;
  children: number;
  special_requests?: string;
  password: string;
}

export type Page = 'home' | 'destinations' | 'hotels' | 'packages' | 'destination-detail' | 'hotel-detail' | 'package-detail' | 'booking' | 'my-trips';