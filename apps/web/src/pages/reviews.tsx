import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api, type Title, type User } from '@/lib/api';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<
    { id: string; body: string; user: User; title: Title }[]
  >([]);

  useEffect(() => {
    void api<{ reviews: typeof reviews }>('/reviews').then((d) =>
      setReviews(d.reviews),
    );
  }, []);

  return (
    <main className="page">
      <h1>Reviews</h1>
      {reviews.length ? (
        reviews.map((r) => (
          <article key={r.id} className="card" style={{ marginBottom: 12 }}>
            <Link to={`/title/${r.title.mediaType}/${r.title.tmdbId}`}>
              {r.title.title}
            </Link>
            <p>
              <Link to={`/u/${r.user.username}`}>@{r.user.username}</Link>
            </p>
            <p>{r.body}</p>
          </article>
        ))
      ) : (
        <p className="muted">No reviews yet.</p>
      )}
    </main>
  );
}
