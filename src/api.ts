import { Bin, FleetTruck } from './types';

export interface PythonHealth {
  status: string;
  backend: string;
  uptime: string;
  totalBins: number;
  totalFleet: number;
}

export interface RouteOptimizationResult {
  success: boolean;
  optimizedRoute: Array<{
    binId: string;
    name: string;
    lat: number;
    lng: number;
    distanceKm: number;
  }>;
  totalDistanceKm: number;
  estimatedDurationMins: number;
  truck: string;
  algorithm: string;
}

export interface PythonAnalytics {
  criticalCount: number;
  warningCount: number;
  normalCount: number;
  averageFillPercentage: number;
  co2ReducedKg: number;
  fuelEfficiencyGain: string;
  predictedPickupsNext24h: number;
  systemEfficiencyScore: number;
}

export async function checkPythonBackendHealth(): Promise<PythonHealth | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Python backend not reachable:', err);
    return null;
  }
}

export async function fetchBinsFromPython(): Promise<Bin[] | null> {
  try {
    const res = await fetch('/api/bins');
    if (!res.ok) return null;
    const data = await res.json();
    return data.bins;
  } catch (err) {
    console.warn('Error fetching bins from Python:', err);
    return null;
  }
}

export async function fetchFleetFromPython(): Promise<FleetTruck[] | null> {
  try {
    const res = await fetch('/api/fleet');
    if (!res.ok) return null;
    const data = await res.json();
    return data.fleet;
  } catch (err) {
    console.warn('Error fetching fleet from Python:', err);
    return null;
  }
}

export async function cleanBinInPython(binId: string): Promise<{ success: boolean; bin?: Bin; message?: string }> {
  try {
    const res = await fetch('/api/bins/clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ binId }),
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch (err) {
    console.warn('Error cleaning bin via Python:', err);
    return { success: false };
  }
}

export async function optimizeRouteWithPython(): Promise<RouteOptimizationResult | null> {
  try {
    const res = await fetch('/api/optimize-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Error running Python route optimization:', err);
    return null;
  }
}

export async function fetchPythonAnalytics(): Promise<PythonAnalytics | null> {
  try {
    const res = await fetch('/api/analytics');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Error fetching Python analytics:', err);
    return null;
  }
}

export async function tickTimelapseInPython(): Promise<Bin[] | null> {
  try {
    const res = await fetch('/api/timelapse/tick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.bins;
  } catch (err) {
    console.warn('Error ticking timelapse in Python:', err);
    return null;
  }
}
