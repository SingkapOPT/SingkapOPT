import fetch from 'node-fetch';

async function diagnose() {
  const url = 'https://script.google.com/macros/s/AKfycbyAIg31KJ-0losjEp_dPoxtBTCC6Y3DA7i0cRMdnCffPNCBhMSqiDveMaIz85_hg7df/exec';
  try {
    const res = await fetch(url);
    console.log('Old App Script GET Status:', res.status, res.statusText);
    const text = await res.text();
    console.log('Length:', text.length);
    console.log('Preview (first 1000):', text.substring(0, 1000));
  } catch (err: any) {
    console.error('Error fetching old apps script:', err);
  }
}

diagnose();
