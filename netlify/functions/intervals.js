const https = require('https');

const ATHLETE_ID      = process.env.INTERVALS_ATHLETE_ID;
const INTERVALS_KEY   = process.env.INTERVALS_API_KEY;
const FUNCTION_SECRET = process.env.FORJA_SECRET;
const auth = Buffer.from(`API_KEY:${INTERVALS_KEY}`).toString('base64');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-forja-secret',
  'Content-Type': 'application/json'
};

function checkAuth(event) {
  const secret = event.headers['x-forja-secret'];
  return !FUNCTION_SECRET || secret === FUNCTION_SECRET;
}

function intervalsRequest(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'intervals.icu',
      path,
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) })
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: responseData }));
    });
    req.on('error', (e) => resolve({ status: 500, body: JSON.stringify({ error: e.message }) }));
    if (data) req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (!checkAuth(event)) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };

  const params = event.queryStringParameters || {};
  const action = params.action;

  try {
    if (event.httpMethod === 'GET' && action === 'wellness') {
      const days = Math.min(Math.max(parseInt(params.days || '7') || 7, 1), 30);
      const newest = new Date().toISOString().slice(0, 10);
      const oldest = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
      const res = await intervalsRequest('GET', `/api/v1/athlete/${ATHLETE_ID}/wellness?oldest=${oldest}&newest=${newest}`);
      return { statusCode: res.status, headers: CORS, body: res.body };
    }

    if (event.httpMethod === 'GET' && action === 'list') {
      const start = (params.start || '').replace(/[^0-9-]/g, '');
      const end   = (params.end   || '').replace(/[^0-9-]/g, '');
      if (!start || !end) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'start/end requeridos' }) };
      const res = await intervalsRequest('GET', `/api/v1/athlete/${ATHLETE_ID}/events?oldest=${start}&newest=${end}`);
      return { statusCode: res.status, headers: CORS, body: res.body };
    }

    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};
