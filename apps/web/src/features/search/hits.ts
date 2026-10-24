import { api, type Person, type Title, type User } from '@/lib/api';

export const SEARCH_TABS = ['titles', 'people', 'lists', 'users'] as const;
export type SearchTab = (typeof SEARCH_TABS)[number];

export type PublicList = {
  name: string;
  slug: string;
  itemCount: number;
  posters: (string | null)[];
  user?: { username: string | null };
};

export type PaletteHits = {
  titles: Title[];
  people: Person[];
  lists: PublicList[];
  users: User[];
};

export const EMPTY_HITS: PaletteHits = {
  titles: [],
  people: [],
  lists: [],
  users: [],
};

export function readSearchTab(raw: string | null): SearchTab {
  return SEARCH_TABS.includes(raw as SearchTab) ? (raw as SearchTab) : 'titles';
}

export function personHref(person: Person) {
  const q = new URLSearchParams({
    person: String(person.id),
    name: person.name,
    credit: 'cast',
  });

  return `/discover?${q.toString()}`;
}

export function listHref(list: PublicList) {
  return `/u/${list.user?.username ?? ''}/list/${list.slug}`;
}

export async function fetchPaletteHits(q: string): Promise<PaletteHits> {
  const enc = encodeURIComponent(q);
  const [titles, people, lists, users] = await Promise.all([
    api<{ results: Title[] }>(`/titles/search?q=${enc}`),
    api<{ people: Person[] }>(`/discover/people?role=cast&q=${enc}`),
    api<{ lists: PublicList[] }>(`/lists?q=${enc}`),
    api<{ users: User[] }>(`/users/search?q=${enc}`),
  ]);

  return {
    titles: titles.results.slice(0, 6),
    people: people.people.slice(0, 6),
    lists: lists.lists.slice(0, 6),
    users: users.users.slice(0, 6),
  };
}
