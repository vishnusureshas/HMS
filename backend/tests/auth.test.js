import request from 'supertest';
import app from '../src/app.js';

describe('Auth', () => {
  it('should reject registration without email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ password: 'Pass123!', role: 'patient', firstName: 'John', lastName: 'Doe' });
    expect(res.statusCode).toBe(400);
  });

  it('should register a new patient', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'Pass123!', role: 'patient', firstName: 'John', lastName: 'Doe' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'Pass123!', role: 'patient', firstName: 'Jane', lastName: 'Doe' });
    expect(res.statusCode).toBe(400);
  });

  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'Pass123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('patient');
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });

  it('should return current user with valid token', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com', password: 'Pass123!' });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe('test@test.com');
  });

  it('should reject unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
