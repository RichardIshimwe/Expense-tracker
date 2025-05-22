// import request from 'supertest';

// const BASE_URL = 'http://localhost:4001';
// const ADMIN_JWT =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDc5MDUyNDIsImV4cCI6MTc0Nzk5MTY0Mn0.c2u0Ug6BI3gYe2F0qS3IYFtLS4mCm7RoCBtAo7LAfro';

// const api = () => request(BASE_URL);

// describe('Expense API (live server)', () => {
//   test('GET /api/health → { status: "ok" }', async () => {
//     const res = await api()
//       .get('/api/health')
//       .set('Authorization', `Bearer ${ADMIN_JWT}`);

//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('status', 'ok');
//   });

//   test('GET /api/expenses/my-expenses → array of expenses', async () => {
//     const res = await api()
//       .get('/api/expenses/my-expenses')
//       .set('Authorization', `Bearer ${ADMIN_JWT}`);

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);
//   });

//   test('GET /api/expenses/pending-approvals → only pending', async () => {
//     const res = await api()
//       .get('/api/expenses/pending-approvals')
//       .set('Authorization', `Bearer ${ADMIN_JWT}`);

//     expect(res.statusCode).toBe(200);
//     expect(Array.isArray(res.body)).toBe(true);

//     res.body.forEach((expense: any) => {
//       expect(expense.status).toBe('pending');
//     });
//   });
// });

import request from 'supertest';

const BASE_URL = 'http://localhost:4001';
const ADMIN_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDc5MDUyNDIsImV4cCI6MTc0Nzk5MTY0Mn0.c2u0Ug6BI3gYe2F0qS3IYFtLS4mCm7RoCBtAo7LAfro';

const api = () => request(BASE_URL);

describe('Expense API (live server)', () => {
  test('GET /api/health → { status: "ok" }', async () => {
    console.log('🧪 Running test: GET /api/health');

    const res = await api()
      .get('/api/health')
      .set('Authorization', `Bearer ${ADMIN_JWT}`);

    console.log('✅ Response:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('GET /api/expenses/my-expenses → array of expenses', async () => {
    console.log('🧪 Running test: GET /api/expenses/my-expenses');

    const res = await api()
      .get('/api/expenses/my-expenses')
      .set('Authorization', `Bearer ${ADMIN_JWT}`);

    console.log('✅ Number of expenses:', res.body.length);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/expenses/pending-approvals → only pending', async () => {
    console.log('🧪 Running test: GET /api/expenses/pending-approvals');

    const res = await api()
      .get('/api/expenses/pending-approvals')
      .set('Authorization', `Bearer ${ADMIN_JWT}`);

    console.log('✅ Pending approvals:', res.body.length);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    res.body.forEach((expense: any) => {
      expect(expense.status).toBe('pending');
    });
  });
});


