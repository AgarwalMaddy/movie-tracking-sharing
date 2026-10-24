export type PublicUser = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  bio: string | null;
};

export type UserRow = {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  bio?: string | null;
};
