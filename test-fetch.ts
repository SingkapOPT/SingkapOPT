import fetch from 'node-fetch';

async function diagnose() {
  const url = 'https://script.google.com/macros/s/AKfycbw_aG1Fr52DhwGalgTL-5bfW1Fwl-bKBTGIQ2i923SeLn6J5AHa0EazyMWGvtlBvYxSOQ/exec';
  console.log('--- POST DIAGNOSTIC ---');
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ action: 'read' }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('POST Status:', res.status, res.statusText);
    console.log('POST Headers:', Object.fromEntries(res.headers.entries()));
    const body = await res.text();
    console.log('POST Body length:', body.length);
    console.log('POST Body start:', body.substring(0, 1000));
  } catch (err) {
    console.error('POST Error:', err);
  }
}

diagnose();
