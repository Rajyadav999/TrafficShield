# TrafficShield 🛡️
### Intelligent Load Balancing and Performance Optimization System

TrafficShield is a scalable web application system that demonstrates how to handle high user traffic using multiple backend instances, NGINX load balancing, Redis caching, and rate limiting. The system simulates real-world traffic conditions and shows measurable performance improvements when proper scaling techniques are applied.

---

## 📌 Project Objective

Most basic web applications fail or slow down when many users access them simultaneously due to single-server limitations. TrafficShield solves this by introducing **horizontal scaling** and **traffic management** — distributing incoming requests across multiple backend servers and optimizing resource usage.

---

## 🏗️ System Architecture

```
                ┌────────────────────┐
                │   Client Requests  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │       NGINX        │
                │  Load Balancer     │
                │ + Rate Limiting    │
                │     (Port 80)      │
                └─────────┬──────────┘
                          │
                Round Robin Distribution
        ┌────────────┬────────────┬
        ▼            ▼            ▼
 ┌────────────┐ ┌────────────┐ ┌────────────┐
 │ Instance 1 │ │ Instance 2 │ │ Instance 3 │
 │ Port 8001  │ │ Port 8002  │ │ Port 8003  │
 └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 ┌──────────────┐           ┌──────────────┐
 │   MongoDB    │           │    Redis     │
 │  (Database)  │           │   (Cache)    │
 └──────────────┘           └──────────────┘


---

## ✨ Features

- **Multi-Instance Backend** — Run the same FastAPI app on multiple ports simultaneously
- **NGINX Load Balancing** — Round-robin traffic distribution across all instances
- **Rate Limiting** — Prevent server abuse by restricting requests per client IP
- **Redis Caching** — Reduce repeated database queries and improve response speed
- **Load Testing** — Simulate 100 / 1000 / 10000 concurrent users using k6
- **Performance Monitoring** — Measure and compare response time, throughput, and failure rate

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | FastAPI (Python) |
| Load Balancer | NGINX |
| Database | MongoDB |
| Cache | Redis |
| Load Testing | k6 |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
TrafficShield/
│
├── backend/
│   ├── main.py               # FastAPI application
│   ├── db.py                 # MongoDB connection (Motor async driver)
│   ├── .env                  # Environment variables (not committed)
│   └── requirements.txt      # Python dependencies
│
├── nginx/
│   └── nginx.conf            # Load balancer + rate limiting config
│
├── load-tests/
│   └── test.js               # k6 load testing scripts
│
├── frontend/                 # Vite + React + TypeScript app
│
├── .gitignore
├── docker-compose.yml        # Orchestrates all services
└── README.md
```

---

## ⚙️ Prerequisites

- Windows with WSL2 (Ubuntu)
- Python 3.12+
- Node.js 18+
- MongoDB 7.0
- Redis
- NGINX
- k6
- Docker

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/TrafficShield.git
cd TrafficShield
```

### 2. Start Required Services (WSL)

```bash
# Start MongoDB
sudo systemctl start mongod

# Start Redis
sudo systemctl start redis
```

### 3. Setup and Run Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run multiple instances
uvicorn main:app --port 8001 &
uvicorn main:app --port 8002 &
uvicorn main:app --port 8003 &
```

### 4. Start NGINX Load Balancer

```bash
sudo nginx -c ~/project/TrafficShield/nginx/nginx.conf
```

### 5. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🔀 Load Balancing

NGINX distributes traffic across 3 backend instances using **round-robin** strategy. Each request is forwarded to the next available instance in rotation.

Every API response includes an `instance_port` field so you can see which instance handled the request:

```json
{
  "message": "TrafficShield API is live",
  "instance_port": 8001,
  "status": "healthy"
}
```

---

## 🚦 Rate Limiting

NGINX restricts each client IP to a maximum of **10 requests per second**. Clients exceeding this threshold receive a `429 Too Many Requests` response, preventing server abuse and crashes.

---

## ⚡ Redis Caching

Frequently requested data is cached in Redis with a configurable TTL. Cache hits skip the MongoDB query entirely, significantly reducing response time under high load.

---

## 📊 Load Testing

k6 is used to simulate concurrent users and measure system performance.

### Run Load Tests

```bash
# Light load - 100 users
k6 run --vus 100 --duration 30s load-tests/test.js

# Medium load - 1000 users
k6 run --vus 1000 --duration 30s load-tests/test.js

# Heavy load - 10000 users
k6 run --vus 10000 --duration 30s load-tests/test.js
```

### Metrics Captured

| Metric | Description |
|---|---|
| `http_req_duration` | Response time per request |
| `http_req_failed` | Failure rate |
| `http_reqs` | Total throughput (requests/sec) |

---

## 📈 Performance Results

| Scenario | Avg Response Time | Failure Rate | Throughput |
|---|---|---|---|
| Single instance (no LB) | ~TBD ms | ~TBD% | ~TBD req/s |
| 3 instances + NGINX | ~TBD ms | ~TBD% | ~TBD req/s |
| 3 instances + NGINX + Redis | ~TBD ms | ~TBD% | ~TBD req/s |

> Results will be updated after load testing is completed.

---

## 🐳 Docker Setup

Spin up all services with a single command:

```bash
docker-compose up --build
```

This starts:
- 3 FastAPI backend containers
- MongoDB container
- Redis container

NGINX runs on WSL directly and routes to the Docker containers.

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=wanderlust
PORT=8000

```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check + instance info |
| GET | `/health` | Detailed health status |
| GET | `/items` | Fetch all items (cached) |
| POST | `/items` | Create a new item |

---

## 👤 Author

**Raj Yadav**
- GitHub: [Rajydav999](https://github.com/Rajyadav999)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).