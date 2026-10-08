export interface FilterConfig {
  minDistanceKm: number; // default: 1.8 km
  maxDistanceKm: number; // default: 8.1 km
  conditionMode: 'OR' | 'AND';
  responseDelayMs: number; // default: 1 ms
  targetKeywords: string[]; // default: ['Match', 'Accept', 'Book', 'Order', 'स्वीकार']
  soundAlert: boolean;
  vibrationAlert: boolean;
  amoledMode: boolean;
  batteryEcoScan: boolean;
  keepScreenAwake: boolean;
  autoStopOnScreenOff: boolean;
  showFloatingHud: boolean;
  hudPosition: { x: number; y: number };
}

export interface OrderItem {
  id: string;
  platform: 'Rapido' | 'Uber' | 'Ola' | 'Porter' | 'Zomato' | 'Dunzo' | 'Custom';
  customerName: string;
  distanceKm: number;
  fareInr: number;
  pickupLocation: string;
  dropLocation: string;
  buttonLabel: string;
  spawnTimestamp: number;
  status: 'pending' | 'matched_clicked' | 'ignored' | 'expired';
  latencyMs?: number;
  matchReason?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  timeMs: number;
  distanceKm: number;
  isMatched: boolean;
  reason: string;
  latencyMs: number;
  platform: string;
  buttonLabel: string;
}

export type ActiveTab = 'scanner' | 'rules' | 'hud' | 'android-apk' | 'logs';
