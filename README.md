⚡ High-Concurrency Flash Sale Engine
====================================

> **Architecting a production-grade backend capable of handling 2,000+ concurrent requests with 100% data consistency.**

📖 The Story Behind the System
------------------------------

### The Goal

In the world of e-commerce, "Flash Sales" (like Big Billion Days) are the ultimate stress test. The goal was simple but brutal: **Sell 1,000 iPhones to 10,000 users who all click "Buy" at the exact same second.**

Most standard web apps fail this test. They crash (Status 500) or, worse, they **oversell**—promising 1,050 items when only 1,000 exist. My mission was to build a system that prioritizes **Data Integrity** and **Availability** under extreme load.

🏗️ The Engineering Journey (Hit & Trials)
------------------------------------------

Building distributed systems is never a straight line. Here is how the architecture evolved:

### Phase 1: The Naive Approach (Failure)

*   **Attempt:** A simple Node.js API checking the database: if (stock > 0) { stock-- }.
    
*   **The Problem:** **Race Conditions.** When 500 users hit the API simultaneously, they all read stock = 1000 before anyone wrote the new value.
    
*   **Result:** Sold 1,200 items from a stock of 1,000. **(Architecture Fail)**
    

### Phase 2: The Locking Mechanism (Success)

*   **Solution:** Implemented **Pessimistic Locking** using **Redis**.
    
*   **Logic:** Before touching the database, a user must acquire a "Mutex Lock" (SETNX). If they can't get the lock, they get a 409 Conflict (Queue) instead of crashing.
    
*   **Result:** **Zero Overselling.** The system correctly rejected parallel requests ensuring Strong Consistency.
    

### Phase 3: The "It Works on My Machine" Syndrome

*   **The Problem:** Moving from localhost to Docker caused ENOTFOUND networking errors. The Node container couldn't find the Redis container.
    
*   **Solution:** Orchestrated the entire stack using **Docker Compose**, utilizing internal service discovery (redis:6379 instead of localhost) and environment variable injection.
    

### Phase 4: Stress Testing & Observability

*   **The Problem:** "How do I know it works?"
    
*   **Solution:** Integrated **Prometheus & Grafana** for real-time monitoring and **k6** for load generation.
    
*   **Outcome:** Validated the system against **2,000 concurrent virtual users**. Achieved a 0% crash rate.
    

🏛️ System Architecture
-----------------------

The system is designed as a modular microservices architecture:

```    
User((Users)) -->|HTTP Requests| Nginx[Nginx Gateway]      
Nginx -->|Load Balance| API[Node.js API Cluster]      
API -->|Acquire Lock| Redis[Redis Cache]      
API -->|Metrics| Prom[Prometheus]      
Prom -->|Visualize| Grafana[Grafana Dashboard]   
```

<img width="6211" height="780" alt="API Cluster Monitoring-2025-12-17-080046" src="https://github.com/user-attachments/assets/ae9b75b0-a64f-44b4-baee-b98f33bdcf34" />


*   **Gateway (Nginx):** Acts as a reverse proxy, shielding the backend from direct exposure and handling connection pooling.
    
*   **Compute (Node.js/Express):** Handles business logic and transaction management.
    
*   **State Management (Redis):** Used for distributed locking (high-speed write operations) to handle the "Traffic Jam."
    
*   **Observability (Prometheus/Grafana):** Provides "CCTV" visibility into RPS, latency, and error rates.
    

📊 Performance Benchmarks
-------------------------

We pushed the system to its limits using **k6** on a local environment.

**Metric Result Insight Concurrent Users 2,000 VUs** Simulating a massive traffic spike.**Crash Rate 0% ** No 500 Internal Server Errors. **Overselling 0 Items** 100% Data Consistency maintained. **Conflict Rate~25%** Correctly identified and queued parallel users. **Throughput ~1000 RPM** Limited by single-node Redis locking (Safe Mode).

> _Note: The high p95 latency (~10s) observed during max load confirms the "Queueing" behavior of the lock. Future optimizations will involve Lua Scripting to reduce network round-trips._

🛠️ Tech Stack
--------------

*   **Runtime:** Node.js, Express.js
    
*   **Database/Cache:** Redis (Distributed Locking)
    
*   **Infrastructure:** Docker, Docker Compose
    
*   **Gateway:** Nginx
    
*   **Testing:** k6 (Load Testing)
    
*   **Monitoring:** Prometheus, Grafana
    

🚀 How to Run
-------------

1.  ``` git clone https://github.com/mayurbadgujar03/High-Concurrency-Flash-Sale-API.git ```
    
2.  ``` docker-compose up -d --build ```
    
3.  ``` k6 run scripts/stability\_test.js ```
    
4.  Open Grafana at ```http://localhost:3000``` to see the traffic live.
