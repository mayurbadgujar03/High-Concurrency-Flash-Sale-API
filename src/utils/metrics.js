import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500, 1000],
})

export const totalSales = new client.Counter({
    name: 'iphone_sales_total',
    help: 'Total number of iPhones sold',
})

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(totalSales);

export default register;