# TrafficShield 🛡️
### Intelligent Load Balancing, Performance Optimization & Auto-Healing System for WanderLust

TrafficShield is the infrastructure layer built around the **WanderLust Travel Booking App** — a real-world FastAPI + React application. It demonstrates how to handle high user traffic using multiple backend instances, NGINX load balancing, Redis caching, rate limiting, auto-healing, and real-time monitoring via Prometheus and Grafana.

---

## 📌 Project Objective

Most basic web applications fail or slow down when many users access them simultaneously due to single-server limitations. TrafficShield solves this by introducing **horizontal scaling**, **traffic management**, **auto-healing**, and **live monitoring** — running multiple instances of the WanderLust backend and distributing incoming requests across them using NGINX.

---

## 🏗️ System Architecture

```
         ┌──────────────────────────────────────────────┐
         │               Client Side                    │
         │                                              │
         │   ┌─────────────────┐   ┌────────────────┐   │
         │   │ React Frontend  │   │  k6 Load       │   │
         │   │  (Port 5173)    │   │  Tester        │   │
         │   └────────┬────────┘   └───────┬────────┘   │
         └────────────┼───────────────────-┼────────────┘
                      │                   │
                      └─────────┬─────────┘
                                │ HTTP Requests
                                ▼
         ┌──────────────────────────────────────────────┐
         │             TrafficShield Layer              │
         │                                              │
         │   ┌──────────────────────────────────────┐   │
         │   │        NGINX  (Port 80)              │   │
         │   │  Load Balancer + Rate Limiting       │   │
         │   │  Auto-Failover + Health Checks       │   │
         │   └─────────────────┬────────────────────┘   │
         │                     │ Round Robin            │
         │          ┌──────────┼──────────┐             │
         │          ▼          ▼          ▼             │
         │   ┌──────────┐ ┌──────────┐ ┌──────────┐     │
         │   │Wanderlust│ │Wanderlust│ │Wanderlust│     │
         │   │   API    │ │   API    │ │   API    │     │
         │   │Port 8001 │ │Port 8002 │ │Port 8003 │     │
         │   │(healthy) │ │(healthy) │ │(healthy) │     │
         │   └────┬─────┘ └────┬─────┘ └────┬─────┘     │
         └────────┼────────────┼────────────┼───────────┘
                  └────────────┼────────────┘
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
          ┌──────────────┐         ┌──────────────┐
          │   MongoDB    │         │    Redis     │
          │  wanderlust  │         │   Cache      │
          │  (Port 27017)│         │  (Port 6379) │
          └──────────────┘         └──────────────┘
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
          ┌──────────────┐         ┌──────────────┐
          │  Prometheus  │         │   Grafana    │
          │  (Port 9090) │────────▶│  (Port 3000) │
          │  Metrics     │         │  Dashboard   │
          └──────────────┘         └──────────────┘
```

---

## ✨ Features

- **Multi-Instance Backend** — Same WanderLust API runs on ports 8001, 8002, 8003 simultaneously
- **NGINX Load Balancing** — Round-robin traffic distribution across all instances
- **Auto-Failover** — NGINX automatically stops routing to crashed instances
- **Rate Limiting** — Restricts excessive requests per client IP via NGINX
- **Redis Caching** — Reduces repeated MongoDB queries on high-traffic endpoints
- **Auto-Healing** — Docker automatically restarts any crashed container within seconds
- **Prometheus Monitoring** — Scrapes metrics from all 3 instances every 5 seconds
- **Grafana Dashboard** — Live visualization of requests, response time, and errors
- **Load Testing** — Simulates 100 / 1000 / 10000 concurrent users using k6
- **Docker Compose** — One command starts the entire system

---

## 🛠️ Tech Stack

| Layer | Technology | Why Used |
|---|---|---|
| Frontend | React + TypeScript (Vite) | Fast modern UI |
| Backend | FastAPI (Python) | Async, fast REST API framework |
| Load Balancer | NGINX | Round-robin + rate limiting + failover |
| Database | MongoDB 7.0 | Flexible JSON document storage |
| Cache | Redis | In-memory caching for fast responses |
| Load Testing | k6 | Simulates thousands of virtual users |
| Containerization | Docker + Docker Compose | One command startup |
| Monitoring | Prometheus | Collects metrics from all instances |
| Dashboard | Grafana | Live visual monitoring dashboard |
| Environment | Windows + WSL2 (Ubuntu) | Development environment |

---

## 📁 Project Structure

```
TrafficShield/
│
├── backend/
│   ├── main.py               # WanderLust FastAPI application
│   ├── Dockerfile            # Docker build instructions
│   ├── .dockerignore         # Files excluded from Docker build
│   ├── .env                  # Environment variables (not committed)
│   ├── venv/                 # Python virtual environment (not committed)
│   └── requirements.txt      # Python dependencies
│
├── nginx/
│   └── nginx.conf            # Load balancer + rate limiting + failover config
│
├── monitoring/
│   ├── prometheus.yml        # Prometheus scrape configuration
│   └── grafana-datasource.yml # Grafana auto data source config
│
├── load-tests/
│   └── test.js               # k6 load testing scripts
│
├── frontend/                 # Vite + React + TypeScript (WanderLust UI)
│   └── .env                  # VITE_API_URL points to NGINX port 80
│
├── .gitignore
├── docker-compose.yml        # Orchestrates all 7 services
└── README.md
```

---

## ⚙️ Prerequisites

- Windows with WSL2 (Ubuntu)
- Python 3.12+
- Node.js 18+
- NGINX
- k6 v1.7.1+
- Docker + Docker Compose

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Rajyadav999/TrafficShield.git
cd TrafficShield
```

### 2. Start All Services with Docker

```bash
docker-compose up -d
```

This automatically starts all 7 services:

| Service | Port |
|---|---|
| WanderLust Instance 1 | 8001 |
| WanderLust Instance 2 | 8002 |
| WanderLust Instance 3 | 8003 |
| MongoDB | 27017 |
| Redis | 6379 |
| Prometheus | 9090 |
| Grafana | 3000 |

### 3. Start NGINX Load Balancer

```bash
sudo systemctl start nginx
```

### 4. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173` ✅

---

## 🔀 Load Balancing

NGINX distributes traffic across 3 WanderLust instances using **round-robin** strategy:

```
Request 1 → port 8001
Request 2 → port 8002
Request 3 → port 8003
Request 4 → port 8001 (cycles back)
```

Every API response includes an `instance_port` field to prove which server handled it:

```json
{
  "message": "WanderLust Travel API is live 🌍",
  "instance_port": 8001,
  "status": "healthy"
}
```

---

## 🚦 Rate Limiting

NGINX restricts each client IP to a maximum of **1000 requests per second**. Clients exceeding this receive a `429 Too Many Requests` response.

---

## ⚡ Redis Caching

High-traffic endpoints `/destinations` and `/hotels` are cached in Redis for **60 seconds**:

```
First request  → Check Redis → MISS → Query MongoDB → Save to Redis → Return
Next requests  → Check Redis → HIT  → Return instantly (no MongoDB) ✅
```

---

## 🔄 Auto-Healing

Every backend container has `restart: always` in Docker Compose. If any instance crashes:

```
Instance crashes ❌
        ↓
Docker detects it within seconds
        ↓
Container automatically restarts ✅
        ↓
NGINX routes to healthy instances during restart
        ↓
System heals itself — no human needed ✅
```

Test it yourself:
```bash
# Terminal 1 — watch containers
watch -n 2 docker-compose ps

# Terminal 2 — kill an instance
docker stop wanderlust_8001

# Watch it restart automatically within 10-15 seconds!
```

---

## 📊 Monitoring

### Prometheus — `http://localhost:9090`
Scrapes metrics from all 3 instances every 5 seconds including total requests, duration, and error rates.

### Grafana — `http://localhost:3000`
Login: `admin` / `admin123`

Live dashboard showing requests per second per instance, average response time, and traffic distribution.

---

## 📈 Load Testing

```bash
# Run staged load test (100 → 1000 users over 2.5 minutes)
k6 run load-tests/test.js

# Quick stress test
k6 run --vus 1000 --duration 30s load-tests/test.js
```

### Performance Results

| Scenario | Avg Response Time | Failure Rate | Throughput |
|---|---|---|---|
| Single instance (no LB) | ~360ms | ~39% | ~898 req/s |
| 3 instances + NGINX | ~360ms | ~4.46% | ~898 req/s |
| 3 instances + NGINX + Redis | ~17ms | ~4.46% | ~7915 req/s |

---

## 🔑 Environment Variables

`backend/.env`:
```env
MONGO_URL=mongodb://mongodb:27017
DB_NAME=wanderlust
PORT=8001
REDIS_HOST=redis
```

`frontend/.env`:
```env
VITE_API_URL=http://localhost:80
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Cached |
|---|---|---|---|
| GET | `/` | Health check + instance info | ❌ |
| GET | `/health` | Detailed health + timestamp | ❌ |
| GET | `/destinations` | Fetch all destinations | ✅ 60s |
| GET | `/destinations/{id}` | Fetch single destination | ❌ |
| GET | `/hotels` | Fetch all hotels | ✅ 60s |
| GET | `/hotels/{id}` | Fetch single hotel | ❌ |
| GET | `/packages` | Fetch all travel packages | ❌ |
| GET | `/packages/{id}` | Fetch single package | ❌ |
| POST | `/bookings/hotel` | Create hotel booking | ❌ |
| POST | `/bookings/package` | Create package booking | ❌ |
| POST | `/bookings/view` | View bookings by email | ❌ |
| GET | `/search` | Search everything | ❌ |
| GET | `/metrics` | Prometheus metrics endpoint | ❌ |

---

## 👤 Author

**Raj Yadav**
- GitHub: [@Rajyadav999](https://github.com/Rajyadav999)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).