import { Destination, Hotel, Package } from '../types';

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="stars">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span className="rating-num">{rating}</span>
    </span>
  );
}

export function DestinationCard({ dest, onClick }: { dest: Destination; onClick: () => void }) {
  return (
    <div className="card dest-card" onClick={onClick}>
      <div className="card-img-wrap">
        <img src={dest.image} alt={dest.name} loading="lazy" />
        <span className="card-badge">{dest.category}</span>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h3>{dest.name}</h3>
          <span className="card-country">{dest.country}</span>
        </div>
        <p className="card-desc">{dest.description.slice(0, 90)}…</p>
        <div className="card-footer">
          <StarRating rating={dest.rating} />
          <span className="card-price">From ₹{dest.avg_budget.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function HotelCard({ hotel, onClick }: { hotel: Hotel; onClick: () => void }) {
  return (
    <div className="card hotel-card" onClick={onClick}>
      <div className="card-img-wrap">
        <img src={hotel.image} alt={hotel.name} loading="lazy" />
        <span className="card-badge">{hotel.category}</span>
      </div>
      <div className="card-body">
        <h3>{hotel.name}</h3>
        <p className="card-location">📍 {hotel.location}</p>
        <div className="amenity-pills">
          {hotel.amenities.slice(0, 4).map(a => <span key={a} className="pill">{a}</span>)}
        </div>
        <div className="card-footer">
          <StarRating rating={hotel.rating} />
          <span className="card-price">₹{hotel.price_per_night.toLocaleString()}<small>/night</small></span>
        </div>
      </div>
    </div>
  );
}

export function PackageCard({ pkg, onClick }: { pkg: Package; onClick: () => void }) {
  return (
    <div className="card pkg-card" onClick={onClick}>
      <div className="card-img-wrap">
        <img src={pkg.image} alt={pkg.title} loading="lazy" />
        <span className="card-badge">{pkg.duration}</span>
      </div>
      <div className="card-body">
        <h3>{pkg.title}</h3>
        <p className="card-location">📍 {pkg.destinations.join(' · ')}</p>
        <div className="amenity-pills">
          {pkg.includes.slice(0, 4).map(i => <span key={i} className="pill">{i}</span>)}
        </div>
        <div className="card-footer">
          <StarRating rating={pkg.rating} />
          <span className="card-price">₹{pkg.price.toLocaleString()}<small>/person</small></span>
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="card-grid">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="card skeleton">
          <div className="skel-img" />
          <div className="skel-body">
            <div className="skel-line long" />
            <div className="skel-line" />
            <div className="skel-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}