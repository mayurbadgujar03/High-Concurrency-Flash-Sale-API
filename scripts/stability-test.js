import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  scenarios: {
    warm_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 100 },
      ],
      gracefulStop: '5s',
    },

    flash_sale: {
      executor: 'constant-vus',
      startTime: '20s', 
      vus: 2000,        
      duration: '2m', 
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.05'], 
    http_req_duration: ['p(95)<5000'], 
  },
};

export default function () {
  const url = 'http://localhost:8080/api/v1/shop/buy';
  
  const uniqueUser = `user_${uuidv4()}`;

  const payload = JSON.stringify({
    productId: '64c9e654e599a81832123456',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': uniqueUser,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'Success (Sold)': (r) => r.status === 200,
    'Sold Out (Too Late)': (r) => r.status === 400, 
    'Queue/Conflict (Correct Logic)': (r) => r.status === 409, 
    'Server Error (Bad)': (r) => r.status === 500,
  });

  sleep(Math.random() * 2 + 1); 
}