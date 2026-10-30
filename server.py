import json
import math
import time
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

HOST = '127.0.0.1'
PORT = 5000

# Canonical bins database matching types.ts:
# { id, address, fillLevel, status, x, y, weight, temperature, battery, type, lastServiced }
BINS_DB = [
    {
        "id": "B-9021",
        "address": "MG Road",
        "fillLevel": 92,
        "status": "critical",
        "x": 700,
        "y": 200,
        "weight": 45.4,
        "temperature": 24.2,
        "battery": 88,
        "type": "general",
        "lastServiced": "2 days ago"
    },
    {
        "id": "B-8832",
        "address": "100 Feet Road, Indiranagar",
        "fillLevel": 74,
        "status": "warning",
        "x": 450,
        "y": 480,
        "weight": 32.1,
        "temperature": 21.8,
        "battery": 92,
        "type": "recyclable",
        "lastServiced": "1 day ago"
    },
    {
        "id": "B-4412",
        "address": "80 Feet Road, Koramangala",
        "fillLevel": 35,
        "status": "normal",
        "x": 320,
        "y": 350,
        "weight": 12.8,
        "temperature": 19.5,
        "battery": 95,
        "type": "glass",
        "lastServiced": "4 hours ago"
    },
    {
        "id": "B-7714",
        "address": "Brigade Road",
        "fillLevel": 68,
        "status": "warning",
        "x": 580,
        "y": 280,
        "weight": 29.5,
        "temperature": 22.0,
        "battery": 45,
        "type": "organic",
        "lastServiced": "12 hours ago"
    },
    {
        "id": "B-5523",
        "address": "Commercial Street",
        "fillLevel": 15,
        "status": "normal",
        "x": 210,
        "y": 420,
        "weight": 8.2,
        "temperature": 18.1,
        "battery": 79,
        "type": "general",
        "lastServiced": "3 days ago"
    },
    {
        "id": "B-3011",
        "address": "Whitefield Main Road",
        "fillLevel": 88,
        "status": "critical",
        "x": 820,
        "y": 510,
        "weight": 41.2,
        "temperature": 25.6,
        "battery": 62,
        "type": "recyclable",
        "lastServiced": "2 days ago"
    },
    {
        "id": "B-1204",
        "address": "Sampige Road, Malleshwaram",
        "fillLevel": 42,
        "status": "normal",
        "x": 500,
        "y": 120,
        "weight": 19.0,
        "temperature": 20.4,
        "battery": 84,
        "type": "general",
        "lastServiced": "1 day ago"
    },
    {
        "id": "B-6690",
        "address": "Outer Ring Road, HSR Layout",
        "fillLevel": 61,
        "status": "warning",
        "x": 150,
        "y": 220,
        "weight": 26.3,
        "temperature": 23.0,
        "battery": 91,
        "type": "organic",
        "lastServiced": "5 hours ago"
    }
]

# Canonical fleet database matching FleetTruck in types.ts:
# { id, name, status, capacity, currentBinId, driverName, lat, lng, zone, activeZones, battery }
FLEET_DB = [
    {
        "id": "TR-101",
        "name": "EcoTruck Alpha",
        "status": "idle",
        "capacity": 28,
        "currentBinId": None,
        "driverName": "Rajesh Kumar",
        "lat": 100,
        "lng": 500,
        "zone": "Zone 1 — Central CBD",
        "activeZones": ["MG Road", "Brigade Road", "Commercial Street"],
        "battery": 94
    },
    {
        "id": "TR-102",
        "name": "EcoTruck Beta",
        "status": "servicing",
        "capacity": 76,
        "currentBinId": "B-3011",
        "driverName": "Priya Sharma",
        "lat": 800,
        "lng": 480,
        "zone": "Zone 2 — East Corridor",
        "activeZones": ["Whitefield Main", "Forum Mall Sector", "Indiranagar 100ft"],
        "battery": 78
    },
    {
        "id": "TR-103",
        "name": "EcoTruck Gamma",
        "status": "idle",
        "capacity": 12,
        "currentBinId": None,
        "driverName": "Suresh Gowda",
        "lat": 300,
        "lng": 250,
        "zone": "Zone 3 — South Sector",
        "activeZones": ["Koramangala 80ft", "HSR Layout Sec-1", "Outer Ring Road"],
        "battery": 88
    },
    {
        "id": "TR-104",
        "name": "EcoTruck Delta",
        "status": "idle",
        "capacity": 35,
        "currentBinId": None,
        "driverName": "Ananya Sen",
        "lat": 500,
        "lng": 120,
        "zone": "Zone 4 — North Belt",
        "activeZones": ["Malleshwaram Sampige", "Sadashivanagar", "Yeshwanthpur Hub"],
        "battery": 92
    }
]

LOGS = [
    "Python 3.10 Backend engine initialized.",
    "B-9021 reached 92% capacity (CRITICAL).",
    "B-3011 reached 88% capacity (CRITICAL).",
    "EcoTruck Beta dispatched to Whitefield Main Road."
]

def calculate_grid_distance(x1, y1, x2, y2):
    """Euclidean distance on the Bengaluru 1000x600 grid converted to estimated kilometers."""
    pixel_dist = math.hypot(x2 - x1, y2 - y1)
    # Scale factor: 1000px corresponds to ~25km across Bengaluru urban zone
    return pixel_dist * (25.0 / 1000.0)

def optimize_route(truck_x, truck_y, target_bins):
    """Greedy Nearest-Neighbor Traveling Salesperson (TSP) route optimization in Python."""
    if not target_bins:
        return [], 0.0

    unvisited = list(target_bins)
    curr_x, curr_y = truck_x, truck_y
    optimized = []
    total_km = 0.0

    while unvisited:
        nearest = min(unvisited, key=lambda b: calculate_grid_distance(curr_x, curr_y, b['x'], b['y']))
        dist = calculate_grid_distance(curr_x, curr_y, nearest['x'], nearest['y'])
        total_km += dist
        curr_x, curr_y = nearest['x'], nearest['y']
        optimized.append({
            "binId": nearest['id'],
            "name": f"{nearest['id']} - {nearest['address']}",
            "x": nearest['x'],
            "y": nearest['y'],
            "fillLevel": nearest['fillLevel'],
            "distanceKm": round(dist, 2)
        })
        unvisited.remove(nearest)

    return optimized, round(total_km, 2)

class PythonRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/api/health':
            self._set_headers(200)
            data = {
                "status": "ok",
                "backend": "Python 3.10.12 HTTP Server",
                "uptime": "active",
                "totalBins": len(BINS_DB),
                "totalFleet": len(FLEET_DB)
            }
            self.wfile.write(json.dumps(data).encode('utf-8'))

        elif path == '/api/bins':
            self._set_headers(200)
            self.wfile.write(json.dumps({"bins": BINS_DB}).encode('utf-8'))

        elif path == '/api/fleet':
            self._set_headers(200)
            self.wfile.write(json.dumps({"fleet": FLEET_DB}).encode('utf-8'))

        elif path == '/api/analytics':
            self._set_headers(200)
            critical_count = sum(1 for b in BINS_DB if b['status'] == 'critical')
            warning_count = sum(1 for b in BINS_DB if b['status'] == 'warning')
            normal_count = sum(1 for b in BINS_DB if b['status'] == 'normal')
            avg_fill = round(sum(b['fillLevel'] for b in BINS_DB) / len(BINS_DB), 1)

            analytics_data = {
                "criticalCount": critical_count,
                "warningCount": warning_count,
                "normalCount": normal_count,
                "averageFillPercentage": avg_fill,
                "co2ReducedKg": 342.8,
                "fuelEfficiencyGain": "24.5%",
                "predictedPickupsNext24h": critical_count * 2 + warning_count,
                "systemEfficiencyScore": 94.2
            }
            self.wfile.write(json.dumps(analytics_data).encode('utf-8'))

        elif path == '/api/logs':
            self._set_headers(200)
            self.wfile.write(json.dumps({"logs": LOGS}).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            payload = json.loads(body.decode('utf-8'))
        except Exception:
            payload = {}

        if path == '/api/bins/clean':
            bin_id = payload.get('binId')
            target_bin = next((b for b in BINS_DB if b['id'] == bin_id), None)
            if target_bin:
                target_bin['fillLevel'] = 12
                target_bin['status'] = 'normal'
                target_bin['weight'] = 3.5
                target_bin['lastServiced'] = 'Just now'

                msg = f"Python Backend: Bin {bin_id} ({target_bin['address']}) serviced and emptied."
                LOGS.insert(0, msg)

                # Update fleet truck capacity & status
                if FLEET_DB:
                    FLEET_DB[0]['status'] = 'idle'
                    FLEET_DB[0]['capacity'] = min(100, FLEET_DB[0]['capacity'] + 15)
                    FLEET_DB[0]['currentBinId'] = None

                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": msg,
                    "bin": target_bin,
                    "allBins": BINS_DB
                }).encode('utf-8'))
            else:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Bin not found"}).encode('utf-8'))

        elif path == '/api/optimize-route':
            truck = FLEET_DB[0]
            # Prioritize critical and warning bins
            urgent_bins = [b for b in BINS_DB if b['status'] in ('critical', 'warning')]
            route, total_km = optimize_route(truck['lat'], truck['lng'], urgent_bins)

            log_entry = f"Python TSP algorithm computed optimal route ({total_km} km, {len(route)} stops)."
            LOGS.insert(0, log_entry)

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "optimizedRoute": route,
                "totalDistanceKm": total_km,
                "estimatedDurationMins": round(total_km * 3.2, 1),
                "truck": truck['name'],
                "algorithm": "Python 2D TSP Nearest-Neighbor"
            }).encode('utf-8'))

        elif path == '/api/timelapse/tick':
            for b in BINS_DB:
                if b['fillLevel'] < 100:
                    growth = random.randint(1, 4)
                    b['fillLevel'] = min(100, b['fillLevel'] + growth)
                    b['weight'] = round(b['weight'] + (growth * 0.4), 1)
                    if b['fillLevel'] >= 85:
                        b['status'] = 'critical'
                    elif b['fillLevel'] >= 60:
                        b['status'] = 'warning'
                    else:
                        b['status'] = 'normal'

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "bins": BINS_DB
            }).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run():
    print(f"[Python Backend] Starting HTTP Server on http://{HOST}:{PORT} ...")
    httpd = HTTPServer((HOST, PORT), PythonRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("[Python Backend] Server stopped.")

if __name__ == '__main__':
    run()
