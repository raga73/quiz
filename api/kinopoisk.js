// api/kinopoisk.js
// Vercel Serverless Function: проксирует запросы к api.kinopoisk.dev

export default async function handler(req, res) {
  // CORS — на случай, если фронтенд с другого домена (обычно не нужно)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // path — это endpoint kinopoisk.dev: 'movie', 'tv-series' и т.д.
  // Остальные query-параметры — фильтры (rating.kp, limit, sortField...)
  const { path, ...query } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing "path" query parameter' });
  }

  const targetUrl = `https://api.kinopoisk.dev/v1.4/${path}?${new URLSearchParams(query)}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Токен читается из переменной окружения Vercel — в браузер не попадает
        'X-API-KEY': process.env.KP_TOKEN,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Kinopoisk proxy error:', error);
    res.status(500).json({
      error: 'Proxy failed',
      message: error.message,
    });
  }
}
