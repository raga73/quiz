// src/api.js
import { music as staticMusic } from './data';

const PROXY = '/api/kinopoisk';

/* === Фильмы === */
export const fetchTopMovies = async (limit = 10) => {
  const params = new URLSearchParams({
    path: 'movie',                    // endpoint kinopoisk.dev
    'rating.kp': '7-10',
    'votes.kp': '10000-10000000',
    sortField: 'rating.kp',
    sortType: '-1',
    limit: String(limit),
    selectFields: 'id,name,year,rating,votes,genres',
  });

  const res = await fetch(`${PROXY}?${params}`);
  if (!res.ok) throw new Error(`Kinopoisk: ошибка ${res.status}`);
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

/* === Сериалы === */
export const fetchTopShows = async (limit = 10) => {
  const params = new URLSearchParams({
    path: 'movie',
    'rating.kp': '7-10',
    'votes.kp': '5000-10000000',
    type: 'tv-series',
    sortField: 'rating.kp',
    sortType: '-1',
    limit: String(limit),
    selectFields: 'id,name,year,rating,votes,genres',
  });

  const res = await fetch(`${PROXY}?${params}`);
  if (!res.ok) throw new Error(`Kinopoisk: ошибка ${res.status}`);
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

/* === Музыка (пока статика) === */
export const fetchTopMusic = async () => {
  await new Promise((r) => setTimeout(r, 200));
  return staticMusic.map((m) => ({ ...m }));
};

/* === Загружаем всё сразу === */
export const fetchAllRatings = async () => {
  const [movies, shows, music] = await Promise.all([
    fetchTopMovies(),
    fetchTopShows(),
    fetchTopMusic(),
  ]);
  return { movies, shows, music };
};
