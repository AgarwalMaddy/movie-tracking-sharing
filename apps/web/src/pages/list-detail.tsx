import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PosterGrid } from '@/features/titles';
import { api, type Title } from '@/lib/api';

export function ListDetail() {
  const { username = '', slug = '' } = useParams();
  const [list, setList] = useState<{
    name: string;
    description?: string | null;
    items: { title: Title }[];
  } | null>(null);

  useEffect(() => {
    void api<{ list: NonNullable<typeof list> }>(
      `/lists/${username}/${slug}`,
    ).then((d) => setList(d.list));
  }, [username, slug]);

  if (!list) {
    return <main className="page">Loading…</main>;
  }

  return (
    <main className="page">
      <p className="muted">
        <Link to={`/u/${username}`}>@{username}</Link>
      </p>
      <h1>{list.name}</h1>
      <p className="lede">{list.description}</p>
      <PosterGrid titles={list.items.map((i) => i.title)} />
    </main>
  );
}
