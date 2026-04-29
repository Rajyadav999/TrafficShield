import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────
const errorRate = new Rate('error_rate');
const destinationDuration = new Trend('destination_duration');
const hotelDuration = new Trend('hotel_duration');

// ─── Test Config ──────────────────────────────────────────────────
export const options = {
    stages: [
        { duration: '30s', target: 100 },   // ramp up to 100 users
        { duration: '30s', target: 100 },   // hold 100 users
        { duration: '30s', target: 1000 },  // ramp up to 1000 users
        { duration: '30s', target: 1000 },  // hold 1000 users
        { duration: '30s', target: 0 },     // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],  // 95% requests under 2 seconds
        error_rate: ['rate<0.1'],           // error rate below 10%
    },
};

const BASE_URL = 'http://localhost:80';

// ─── Main Test Function ───────────────────────────────────────────
export default function () {

    // Test 1 — Health check
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
        'health status is 200': (r) => r.status === 200,
        'health response has instance_port': (r) => JSON.parse(r.body).instance_port !== undefined,
    });

    // Test 2 — Get destinations (cached after first hit)
    const destRes = http.get(`${BASE_URL}/destinations`);
    check(destRes, {
        'destinations status is 200': (r) => r.status === 200,
        'destinations returns array': (r) => JSON.parse(r.body).length > 0,
    });
    destinationDuration.add(destRes.timings.duration);
    errorRate.add(destRes.status !== 200);

    // Test 3 — Get hotels (cached after first hit)
    const hotelRes = http.get(`${BASE_URL}/hotels`);
    check(hotelRes, {
        'hotels status is 200': (r) => r.status === 200,
        'hotels returns array': (r) => JSON.parse(r.body).length > 0,
    });
    hotelDuration.add(hotelRes.timings.duration);
    errorRate.add(hotelRes.status !== 200);

    // Test 4 — Get packages
    const pkgRes = http.get(`${BASE_URL}/packages`);
    check(pkgRes, {
        'packages status is 200': (r) => r.status === 200,
    });
    errorRate.add(pkgRes.status !== 200);

    // Test 5 — Search
    const searchRes = http.get(`${BASE_URL}/search?q=Goa`);
    check(searchRes, {
        'search status is 200': (r) => r.status === 200,
    });
    errorRate.add(searchRes.status !== 200);

    sleep(1);
}
