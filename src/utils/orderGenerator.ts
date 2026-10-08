import { OrderItem } from '../types';

const PLATFORMS: Array<OrderItem['platform']> = ['Rapido', 'Uber', 'Ola', 'Porter', 'Zomato', 'Dunzo'];

const CITIES_LOCATIONS = [
  { pickup: 'Metro Station Gate 2, Connaught Place', drop: 'Sector 62, Noida IT Park' },
  { pickup: 'Koramangala 4th Block, 80 Feet Road', drop: 'Indiranagar 100 Feet Road' },
  { pickup: 'Andheri West Link Road, Mumbai', drop: 'Bandra Kurla Complex (BKC) Tower 1' },
  { pickup: 'Hitech City Cyber Towers, Hyderabad', drop: 'Gachibowli Financial District' },
  { pickup: 'Malviya Nagar Market, South Delhi', drop: 'Cyber City Phase 2, Gurugram' },
  { pickup: 'Kalyani Nagar Joggers Park, Pune', drop: 'Viman Nagar Phoenix Mall' },
  { pickup: 'Salt Lake Sector 5, Kolkata', drop: 'New Town Action Area 1' },
  { pickup: 'Raja Park Golcha Cinema, Jaipur', drop: 'Mansarovar Metro Station' }
];

const NAMES = [
  'Amit Sharma', 'Rahul Verma', 'Pooja Singh', 'Vikram Patel',
  'Deepak Gupta', 'Neha Joshi', 'Suresh Reddy', 'Ananya Roy'
];

let counter = 1000;

export function generateSampleOrder(forcedDistance?: number): OrderItem {
  counter++;
  const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
  const location = CITIES_LOCATIONS[Math.floor(Math.random() * CITIES_LOCATIONS.length)];
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];

  // If no forced distance, generate according to probability distribution:
  // 35% under 1.8 km, 35% over 8.1 km, 30% in middle (to test ignore filter)
  let distanceKm: number;
  if (forcedDistance !== undefined) {
    distanceKm = forcedDistance;
  } else {
    const roll = Math.random();
    if (roll < 0.35) {
      // Short pickup (< 1.8 km)
      distanceKm = Number((0.4 + Math.random() * 1.35).toFixed(1));
    } else if (roll < 0.70) {
      // Long lucrative haul (> 8.1 km)
      distanceKm = Number((8.2 + Math.random() * 14.5).toFixed(1));
    } else {
      // Mid-range order to be skipped
      distanceKm = Number((2.0 + Math.random() * 5.8).toFixed(1));
    }
  }

  // Calculate realistic fare (Base + dist * perKm)
  const baseRate = platform === 'Porter' ? 180 : (platform === 'Uber' ? 70 : 45);
  const perKm = platform === 'Porter' ? 24 : (platform === 'Uber' ? 18 : 12);
  const fareInr = Math.round(baseRate + distanceKm * perKm);

  return {
    id: `ORD-${counter}-${Date.now().toString().slice(-4)}`,
    platform,
    customerName: name,
    distanceKm,
    fareInr,
    pickupLocation: location.pickup,
    dropLocation: location.drop,
    buttonLabel: 'Match',
    spawnTimestamp: Date.now(),
    status: 'pending'
  };
}
