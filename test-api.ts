import fetch from 'node-fetch';

async function testLocalApi() {
  const url = 'http://localhost:3000/api/external-reports';
  console.log('--- TESTING LOCAL API ---');
  try {
    const res = await fetch(url);
    console.log('Status:', res.status, res.statusText);
    const json = await res.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (err: any) {
    console.error('API Error:', err.message);
  }
}

testLocalApi();
