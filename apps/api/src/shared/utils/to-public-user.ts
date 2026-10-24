import type { PublicUser, UserRow } from '#types/user.js';

export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    image: user.image,
    bio: user.bio ?? null,
  };
}
