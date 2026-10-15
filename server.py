import json
import math
import time
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

HOST = '127.0.0.1'
PORT = 5000

# Initial mock database in memory for Python backend
BINS_DB = [
    {
        "id": "B-9021",
        "name": "Bin #9021 - MG Road Metro",
        "address": "MG Road Station Entrance, Zone A",
        "fillLevel": 92,
        "status": "critical",
        "lat": 12.9756,
        "lng": 77.6068,
        "battery": 88,
        "temp": 31,
        "lastCleaned": "3 hours ago",
        "predictedFullIn": "0.5 hours",
        "wasteType": "Mixed Recyclables",
    },
    {
        "id": "B-3011",
        "name": "Bin #3011 - Whitefield Main",
        "address": "Whitefield Forum Mall Gate 2",
        "fillLevel": 88,
        "status": "critical",
        "lat": 12.9698,
        "lng": 77.7499,
        "battery": 94,
        "temp": 29,
        "lastCleaned": "5 hours ago",
        "predictedFullIn": "1.2 hours",
        "wasteType": "Organic Waste",
    },
    {
        "id": "B-4410",
        "name": "Bin #4410 - Indiranagar 100ft",
        "address": "100ft Road, Corner 12",
        "fillLevel": 72,
        "status": "warning",
        "lat": 12.9784,
        "lng": 77.6408,
        "battery": 76,
        "temp": 32,
        "lastCleaned": "6 hours ago",
        "predictedFullIn": "3.5 hours",
        "wasteType": "Dry Waste",
    },
    {
        "id": "B-1088",
        "name": "Bin #1088 - Koramangala 5th Blk",
        "address": "Jyoti Nivas College Junction",
        "fillLevel": 68,
        "status": "warning",
        "lat": 12.9345,
        "lng": 77.6202,
        "battery": 82,
        "temp": 28,
        "lastCleaned": "8 hours ago",
        "predictedFullIn": "4.1 hours",
        "wasteType": "Paper & Cardboard",
    },
    {
        "id": "B-7721",
        "name": "Bin #7721 - HSR Layout Sect 1",
        "address": "27th Main Rd, HSR Sector 1",
        "fillLevel": 35,
        "status": "normal",
        "lat": 12.9121,
        "lng": 77.6445,
        "battery": 98,
        "temp": 27,
        "lastCleaned": "12 hours ago",
        "predictedFullIn": "14.0 hours",
        "wasteType": "General Waste",
    },
    {
        "id": "B-5502",
        "name": "Bin #5502 - Electronic City",
        "address": "Phase 1 Flyover Hub",
        "fillLevel": 22,
        "status": "normal",
        "lat": 12.8452,
        "lng": 77.6602,
        "battery": 91,
        "temp": 26,
        "lastCleaned": "18 hours ago",
        "predictedFullIn": "19.5 hours",
        "wasteType": "E-Waste / Metal",
    }
]

FLEET_DB = [
    {
        "id": "TRK-01",
        "name": "EcoTruck Alpha (Electric)",
        "status": "idle",
        "capacity": "4.2 Tons",
        "currentLoad": "1.1 Tons",
        "battery": 92,
        "driver": "Alex Rivera",
        "lat": 12.9716,
        "lng": 77.5946,
        "currentBinId": None
    },
    {
        "id": "TRK-02",
        "name": "EcoTruck Beta (Hybrid)",
        "status": "en_route",
        "capacity": "5.0 Tons",
        "currentLoad": "3.4 Tons",
        "battery": 74,
        "driver": "Maria Chen",
        "lat": 12.9650,
        "lng": 77.7200,
        "currentBinId": "B-3011"
    },
    {
        "id": "TRK-03",
        "name": "EcoTruck Gamma (Clean Diesel)",
        "status": "servicing",
        "capacity": "6.5 Tons",
        "currentLoad": "5.2 Tons",
        "battery": 60,
        "driver": "Siddharth Rao",
        "lat": 12.9300,
        "lng": 77.6150,
        "currentBinId": "B-1088"
    }
]

LOGS = [
    "Python Backend initialized.",
    "B-9021 reached 92% capacity (CRITICAL).",
    "B-3011 reached 88% capacity (CRITICAL).",
    "EcoTruck Beta dispatched to Whitefield Main Road."
]

# Route Optimization Helper (Greedy Nearest Neighbor Algorithm in Python)
def calculate_distance(lat1, lon1, lat2, lon2):
    # Haversine distance in km
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def optimize_route(truck_lat, truck_lng, critical_bins):
    if not critical_bins:
        return [], 0
    
    unvisited = list(critical_bins)
    curr_lat, curr_lng = truck_lat, truck_lng
    optimized = []
    total_distance = 0.0

    while unvisited:
        nearest = min(unvisited, key=lambda b: calculate_distance(curr_lat, curr_lng, b['lat'], b['lng']))
        dist = calculate_distance(curr_lat, curr_lng, nearest['lat'], nearest['lng'])
        total_distance += dist
        curr_lat, curr_lng = nearest['lat'], nearest['lng']
        optimized.append({
            "binId": nearest['id'],
            "name": nearest['name'],
            "lat": nearest['lat'],
            "lng": nearest['lng'],
            "distanceKm": round(dist, 2)
        })
        unvisited.remove(nearest)
        
    return optimized, round(total_distance, 2)

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
                target_bin['fillLevel'] = 5
                target_bin['status'] = 'normal'
                target_bin['lastCleaned'] = 'Just now'
                target_bin['predictedFullIn'] = '22.0 hours'
                
                msg = f"Python Backend: Bin {bin_id} ({target_bin['address']}) emptied successfully."
                LOGS.insert(0, msg)
                
                # Update truck status
                if FLEET_DB:
                    FLEET_DB[0]['status'] = 'en_route'
                    FLEET_DB[0]['currentBinId'] = bin_id

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
            urgent_bins = [b for b in BINS_DB if b['status'] in ('critical', 'warning')]
            route, total_km = optimize_route(truck['lat'], truck['lng'], urgent_bins)
            
            log_entry = f"Python TSP Algorithm calculated optimal pickup route ({total_km} km total, {len(route)} stops)."
            LOGS.insert(0, log_entry)

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "optimizedRoute": route,
                "totalDistanceKm": total_km,
                "estimatedDurationMins": round(total_km * 3.5, 1),
                "truck": truck['name'],
                "algorithm": "Python Haversine TSP Nearest-Neighbor"
            }).encode('utf-8'))

        elif path == '/api/timelapse/tick':
            # Simulate bin waste accumulation in Python engine
            for b in BINS_DB:
                if b['fillLevel'] < 100:
                    growth = random.randint(1, 4)
                    b['fillLevel'] = min(100, b['fillLevel'] + growth)
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
