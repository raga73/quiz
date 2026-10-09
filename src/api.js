// src/api.js
export const fetchTop100Movies = async () => {
  const params = new URLSearchParams({
    path: 'movie',
    'rating.kp': '7.5-10',        // порог рейтинга
    'votes.kp': '50000-10000000', // минимум голосов
    sortField: 'rating.kp',
    sortType: '-1',
    limit: '250',                 // ← вот здесь 100 вместо 10
    selectFields: 'id,name,year,rating,votes,genres',
  });
  
  const res = await fetch(`/api/kinopoisk?${params}`);
  // ...
};
