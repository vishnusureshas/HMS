import request from 'supertest';
import app from '../src/app.js';

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('timestamp');
  });
});
