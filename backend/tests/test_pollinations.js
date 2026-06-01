import axios from 'axios';
import fs from 'fs';

async function testSimple() {
  const url = `https://gen.pollinations.ai/image/a%20beautiful%20sunset?width=16&height=16&seed=1&nologo=true`;
  console.log(`Fetching simple Pollinations URL: ${url}`);
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    console.log(`Success! Bytes:`, res.data?.byteLength);
    return true;
  } catch (err) {
    console.error(`Failed with status ${err.response?.status || err.message}:`);
    if (err.response?.data) {
      try {
        const text = Buffer.from(err.response.data).toString('utf8');
        console.error("Response body:", text);
      } catch (_) {}
    }
    return false;
  }
}

testSimple();
