# TrafficShield 🛡️
### Intelligent Load Balancing and Performance Optimization System for WanderLust

TrafficShield is the infrastructure layer built around the **WanderLust Travel Booking App** — a real-world FastAPI + React application. It demonstrates how to handle high user traffic using multiple backend instances, NGINX load balancing, Redis caching, and rate limiting. The system simulates real-world traffic conditions and shows measurable performance improvements when proper scaling techniques are applied.

---

## 📌 Project Objective

Most basic web applications fail or slow down when many users access them simultaneously due to single-server limitations. TrafficShield solves this by introducing **horizontal scaling** and **traffic management** — running multiple instances of the WanderLust backend and distributing incoming requests across them using NGINX.

---

## 🏗️ System Architecture

```
         ┌─────────────────────────────────────────┐
         │            Client Side                   
         │                                         
         │   ┌─────────────────┐  ┌──────────────┐ │
         │   │ React Frontend  │  │  k6 Load     │ │
         │   │  (Port 5173)    │  │  Tester      │ │
         │   └────────┬────────┘  └──────┬───────┘ │
         └────────────┼──────────────────┼─────────┘
                      │                  │
                      └────────┬─────────┘
                               │ HTTP Requests
                               ▼
         ┌─────────────────────────────────────────┐
         │          TrafficShield Layer            │
         │                                         │
         │   ┌─────────────────────────────────┐   │
         │   │     NGINX  (Port 80)                 
         │   │  Load Balancer + Rate Limiting     
         │   └──────────────┬──────────────────┘   
         │                  │ Round Robin           
         │        ┌─────────┼─────────┐            │
         │        ▼         ▼         ▼            │
         │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
         │  │Wanderlust│ │Wanderlust│ │Wanderlust│ │
         │  │   API    │ │   API    │ │   API    │ │
         │  │Port 8001 │ │Port 8002 │ │Port 8003 │ │
         │  └────┬─────┘ └────┬─────┘ └────┬─────┘ │
         └───────┼────────────┼────────────┼───────┘
                 └────────────┼────────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
         ┌──────────────┐         ┌──────────────┐
         │   MongoDB    │         │    Redis     
         │  wanderlust  │         │   Cache       
         │  (Port 27017)│         │  (Port 6379)  
         └──────────────┘         └──────────────┘
```

---

## ✨ Features

- **Multi-Instance Backend** — Same WanderLust API runs on ports 8001, 8002, 8003 simultaneously
- **NGINX Load Balancing** — Round-robin traffic distribution across all instances
- **Rate Limiting** — Restricts excessive requests per client IP via NGINX
- **Redis Caching** — Reduces repeated MongoDB queries on high-traffic endpoints
- **Load Testing** — Simulates 100 / 1000 / 10000 concurrent users using k6
- **Performance Monitoring** — Measures response time, throughput, and failure rate before and after scaling

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | FastAPI (Python) |
| Load Balancer | NGINX |
| Database | MongoDB 7.0 |
| Cache | Redis |
| Load Testing | k6 |
| Containerization | Docker + Docker Compose |
| Environment | Windows + WSL2 (Ubuntu) |

---

## 📁 Project Structure

```
TrafficShield/
│
├── backend/
│   ├── main.py               # WanderLust FastAPI application
│   ├── .env                  # Environment variables (not committed)
│   ├── venv/                 # Python virtual environment (not committed)
│   └── requirements.txt      # Python dependencies
│
├── nginx/
│   └── nginx.conf            # Load balancer + rate limiting config
│
├── load-tests/
│   └── test.js               # k6 load testing scripts
│
├── frontend/                 # Vite + React + TypeScript (WanderLust UI)
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
- k6 v1.7.1+
- Docker

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Rajyadav999/TrafficShield.git
cd TrafficShield
```

### 2. Start Required Services (WSL)

```bash
# Start MongoDB
sudo systemctl start mongod

# Start Redis
sudo systemctl start redis
```

### 3. Setup Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Run Multiple Backend Instances

```bash
# Run all 3 instances simultaneously
PORT=8001 uvicorn main:app --port 8001 &
PORT=8002 uvicorn main:app --port 8002 &
PORT=8003 uvicorn main:app --port 8003 &
```

Each instance runs the same WanderLust API. Every response includes an `instance_port` field so you can see which instance handled the request:

```json
{
  "message": "WanderLust Travel API is live 🌍",
  "instance_port": 8001,
  "status": "healthy"
}
```

### 5. Start NGINX Load Balancer

```bash
sudo nginx -c ~/project/TrafficShield/nginx/nginx.conf
```

All traffic now flows through `http://localhost:80` and is distributed across the 3 instances.

### 6. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`

---

## 🔀 Load Balancing

NGINX distributes traffic across 3 WanderLust instances using **round-robin** strategy. Each incoming request is forwarded to the next available instance in rotation — request 1 → port 8001, request 2 → port 8002, request 3 → port 8003, then cycles again.

---

## 🚦 Rate Limiting

NGINX restricts each client IP to a maximum of **10 requests per second**. Clients exceeding this threshold receive a `429 Too Many Requests` response, preventing server abuse and crashes under heavy load.

---

## ⚡ Redis Caching

High-traffic read endpoints like `/destinations` and `/hotels` are cached in Redis with a configurable TTL. Cache hits skip the MongoDB query entirely — significantly reducing response time under load.

---


## 📊 Load Testing

k6 simulates concurrent users hitting the WanderLust API through NGINX.

### Run Load Tests

```bash
# Light load — 100 users
k6 run --vus 100 --duration 30s load-tests/test.js

# Medium load — 1000 users
k6 run --vus 1000 --duration 30s load-tests/test.js

# Heavy load — 10000 users
k6 run --vus 10000 --duration 30s load-tests/test.js
```

### Metrics Captured

| Metric | Description |
|---|---|
| `http_req_duration` | Response time per request |
| `http_req_failed` | Failure rate |
| `http_reqs` | Total throughput (req/s) |

---


## 🐳 Docker Setup

Spin up the entire system with a single command:

```bash
docker-compose up --build
```

This starts:
- 3 WanderLust FastAPI containers (ports 8001, 8002, 8003)
- MongoDB container
- Redis container

NGINX runs on WSL directly and routes to the Docker containers.

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=wanderlust
PORT=8001
```

> Change `PORT` to `8002` or `8003` when running additional instances manually.

---

## 👤 Author:- Raj Yadav 
- GitHub: [@Rajyadav999](https://github.com/Rajyadav999)
