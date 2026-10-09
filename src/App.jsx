import React, { useState, useEffect } from 'react';
import { facts } from './data';
import { useStore } from './store';

/* === Логотип команды === */
const TeamLogo = () => (
  <div className="team-logo">
    <span className="team-logo-icon">🍊</span>
    <div className="team-logo-text">
      <strong>ХУРМА</strong>
      <span>квиз-команда</span>
    </div>
  </div>
);

/* === Индикатор обновления === */
const RefreshIndicator = () => {
  const lastUpdated = useStore((s) => s.lastUpdated);
  const isRefreshing = useStore((s) => s.isRefreshing);
  const refresh = useStore((s) => s.refreshRatings);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const secondsAgo = lastUpdated
    ? Math.floor((Date.now() - lastUpdated) / 1000)
    : null;
  const label = isRefreshing
    ? 'Обновляем…'
    : secondsAgo === null
    ? 'Ожидание'
    : secondsAgo < 5
    ? 'Только что'
    : `${secondsAgo} сек назад`;

  return (
    <div className="refresh-indicator">
      <span className={`refresh-dot ${isRefreshing ? 'pulsing' : ''}`} />
      <span className="refresh-text">{label}</span>
      <button
        className="refresh-btn"
        onClick={refresh}
        disabled={isRefreshing}
        aria-label="Обновить"
      >
        ↻
      </button>
    </div>
  );
};

/* === Таймер квиза === */
const QuizTimer = () => {
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  const reset = () => {
    setSeconds(60);
    setRunning(false);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className={`quiz-timer ${seconds <= 10 && running ? 'urgent' : ''}`}>
      <div className="timer-display">
        <span className="timer-label">Таймер</span>
        <strong>
          {mm}:{ss}
        </strong>
      </div>
      <div className="timer-controls">
        <button onClick={() => setRunning((r) => !r)}>
          {running ? '⏸' : '▶'}
        </button>
        <button onClick={reset}>↺</button>
      </div>
    </div>
  );
};

/* === Звёзды === */
const StarRating = ({ id }) => {
  const favorite = useStore((s) => s.favorites[id]);
  const setRating = useStore((s) => s.setRating);
  const isFavorite = useStore((s) => s.isFavorite);

  if (!isFavorite(id)) {
    return <p className="rating-hint">Добавь в закладки, чтобы оценить</p>;
  }

  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={n <= (favorite?.rating || 0) ? 'star active' : 'star'}
          onClick={() => setRating(id, n)}
          aria-label={`Оценка ${n}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

/* === Карточка === */
const MediaCard = ({ item, type }) => {
  const isFavorite = useStore((s) => s.isFavorite);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const fav = isFavorite(item.id);

  return (
    <article className="media-card">
      <div className="media-poster">
        <span>{item.poster || item.cover}</span>
        <span className="media-rank">#{item.id}</span>
      </div>
      <div className="media-body">
        <h3>{item.title || item.album}</h3>
        <p className="media-meta">
          {item.artist && <span>{item.artist} · </span>}
          {item.year} · {item.genre}
        </p>
        <div className="media-stats">
          <span className="rating-badge">★ {item.rating}</span>
          <span className="votes">
            {(item.votes || item.listeners || 0).toLocaleString('ru-RU')}
          </span>
        </div>
        <StarRating id={item.id} />
        <button
          className={`fav-btn ${fav ? 'active' : ''}`}
          onClick={() => toggleFavorite(item.id, type)}
        >
          {fav ? '♥ В закладках' : '♡ В закладки'}
        </button>
      </div>
    </article>
  );
};

const App = () => {
  const [tab, setTab] = useState('movies');
  const currentFact = useStore((s) => s.currentFact);
  const setFact = useStore((s) => s.setFact);

  const moviesData = useStore((s) => s.movies);
  const showsData = useStore((s) => s.shows);
  const musicData = useStore((s) => s.music);

  const loadFact = () => {
    const localFact = facts[Math.floor(Math.random() * facts.length)];
    setFact(localFact);
  };

  useEffect(() => {
    loadFact();
  }, []);

  const renderSection = () => {
    let data;
    let type;
    if (tab === 'movies') {
      data = moviesData;
      type = 'movie';
    } else if (tab === 'shows') {
      data = showsData;
      type = 'show';
    } else {
      data = musicData;
      type = 'music';
    }

    if (!data || data.length === 0) {
      return (
        <p style={{ textAlign: 'center', color: '#B69A94', padding: '40px' }}>
          Загрузка данных…
        </p>
      );
    }

    return (
      <div className="media-grid">
        {data.map((item) => (
          <MediaCard key={item.id} item={item} type={type} />
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-inner">
          <TeamLogo />
          <RefreshIndicator />
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <span className="badge">🍊 База знаний команды «Хурма»</span>
          <h1>
            Готовимся к квизу <span className="gradient-text">вместе</span>
          </h1>
          <p className="hero-sub">
            Рейтинги фильмов, сериалов и музыки — плюс случайные факты, которые
            пригодятся на любом туре. Обновляются автоматически.
          </p>
          <div className="hero-actions">
            <QuizTimer />
          </div>
        </div>
      </header>

      <section className="container">
        <div className="tabs">
          {[
            { id: 'movies', label: '🎬 Фильмы' },
            { id: 'shows', label: '📺 Сериалы' },
            { id: 'music', label: '🎵 Музыка' },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {renderSection()}
      </section>

      <section className="fact-section">
        <div className="container">
          <div className="fact-card">
            <div className="fact-icon">💡</div>
            <div className="fact-content">
              <span className="fact-label">Факт для эрудиции</span>
              <p>{currentFact || 'Загрузка...'}</p>
            </div>
            <button className="fact-btn" onClick={loadFact}>
              Ещё факт
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <TeamLogo />
          <p>
            © {new Date().getFullYear()} Команда «Хурма» · Готовимся побеждать
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
