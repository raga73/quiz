// src/api.js

const KP_BASE = '/api/kp/v1.4';

export const fetchTopMovies = async (limit = 10) => {
  const params = new URLSearchParams({
    'rating.kp': '7-10',
    'votes.kp': '10000-10000000',
    sortField: 'rating.kp',
    sortType: '-1',
    limit: String(limit),
    selectFields: 'id,name,year,rating,votes,genres',
  });

  const res = await fetch(`${KP_BASE}/movie?${params}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Kinopoisk: ошибка ${res.status}`);
  }

  const data = await res.json();
  return data.docs.map((m) => ({
    id: m.id,
    title: m.name,
    year: m.year || '—',
    rating: m.rating?.kp ? Number(m.rating.kp.toFixed(1)) : 0,
    votes: m.votes?.kp || 0,
    genre: m.genres?.[0]?.name || '—',
    poster: '🎬',
  }));
};

export const fetchTopShows = async (limit = 10) => {
  const params = new URLSearchParams({
    'rating.kp': '7-10',
    'votes.kp': '5000-10000000',
    type: 'tv-series',
    sortField: 'rating.kp',
    sortType: '-1',
    limit: String(limit),
    selectFields: 'id,name,year,rating,votes,genres',
  });

  const res = await fetch(`${KP_BASE}/movie?${params}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Kinopoisk: ошибка ${res.status}`);
  }

  const data = await res.json();
  return data.docs.map((s) => ({
    id: s.id,
    title: s.name,
    year: s.year || '—',
    rating: s.rating?.kp ? Number(s.rating.kp.toFixed(1)) : 0,
    votes: s.votes?.kp || 0,
    genre: s.genres?.[0]?.name || '—',
    poster: '📺',
  }));
};

// Музыка — оставляем на статике, у Last.fm нет публичного CORS-доступа
import { music as staticMusic } from './data';
export const fetchTopMusic = async () => {
  await new Promise((r) => setTimeout(r, 200));
  return staticMusic.map((m) => ({ ...m }));
};

export const fetchAllRatings = async () => {
  const [movies, shows, music] = await Promise.all([
    fetchTopMovies(),
    fetchTopShows(),
    fetchTopMusic(),
  ]);
  return { movies, shows, music };
};
