export type BinStatus = 'critical' | 'warning' | 'normal';
export type BinType = 'general' | 'recyclable' | 'organic' | 'glass';

export interface Bin {
  id: string;
  address: string;
  fillLevel: number; // 0 to 100
  status: BinStatus;
  x: number; // Map SVG coordinate X
  y: number; // Map SVG coordinate Y
  weight: number; // in kg
  temperature: number; // in °C
  battery: number; // in %
  type: BinType;
  lastServiced: string;
}

export type ActiveTab = 'dashboard' | 'map' | 'analytics' | 'fleet';
export type SystemMode = 'auto' | 'manual';

export interface FleetTruck {
  id: string;
  name: string;
  status: 'idle' | 'en_route' | 'servicing' | 'returning';
  capacity: number; // % full
  currentBinId: string | null;
  driverName: string;
  lat: number;
  lng: number;
}
