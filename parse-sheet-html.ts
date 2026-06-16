import fetch from 'node-fetch';

async function diagnose() {
  const googleSheetId = '1AT51UdJjJpivvwaFQHWXRtqOSzXrnUECJz_3MUxF27s';
  const url = `https://docs.google.com/spreadsheets/d/${googleSheetId}/edit?usp=sharing`;
  try {
    const res = await fetch(url);
    const body = await res.text();
    const idx = body.indexOf('bootstrapData =');
    if (idx !== -1) {
      const slice = body.substring(idx, idx + 2000);
      console.log('bootstrapData starts with:', slice);
    }
    
    // Check if there are other matches for "gid"
    const generalGids = body.match(/gid[\\=](\d+)/g);
    if (generalGids) {
      console.log('General GIDs matched:', Array.from(new Set(generalGids)));
    }
  } catch (err) {
    console.error(err);
  }
}

diagnose();
