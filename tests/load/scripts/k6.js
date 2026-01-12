import http             from 'k6/http';
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "5s", target: 5 },

    { duration: "10s", target: 10 },

    { duration: "5s", target: 0 }
  ]
};

export default function () {
  const BASE_URL = 'http://api:3333/api/v1';
  const resource = 'shorten/7e20ABk';

  const response = http.get(`${BASE_URL}/${resource}`, { headers: { Accepts: "application/json" } });
  check(response, { "status is 302": (r) => r.status === 302 });
  sleep(.300);
};