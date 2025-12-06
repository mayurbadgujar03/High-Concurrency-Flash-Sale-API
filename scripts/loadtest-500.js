import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "20s", target: 500 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const url = "http://localhost:8080/api/v1/shop/buy";

  const uniqueUser = `user_${__VU}_${__ITER}`;

  const payload = JSON.stringify({
    productId: "64c9e654e599a81832123456",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-user-id": uniqueUser,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "is status 200 (Success)": (r) => r.status === 200,
    "is status 400 (Sold Out)": (r) => r.status === 400,
    "is status 409 (Conflict - TRY AGAIN)": (r) => r.status === 409,
    "is status 500 (CRASH)": (r) => r.status === 500,
    "is status 502 (Bad Gateway - Nginx)": (r) => r.status === 502,
    "is status 504 (Gateway Timeout)": (r) => r.status === 504,
    "is status 404 (Not Found)": (r) => r.status === 404,
    "is status 401 (Unauthorized)": (r) => r.status === 401,
    "is connection error (0)": (r) => r.status === 0,
  });

  sleep(0.1);
}
