import { type CastMember } from '@/lib/api';

function compactLabel(member: CastMember) {
  const raw = member.character ?? member.name;

  return raw.replace(/\s*\([^)]*voice[^)]*\)/i, '').trim() || member.name;
}

export function CastStrip({
  cast,
  compact = false,
}: {
  cast: CastMember[];
  compact?: boolean;
}) {
  const people = cast.filter((c) => c.name).slice(0, compact ? 4 : 12);

  if (!people.length) {
    return null;
  }

  return (
    <ul className={compact ? 'starring' : 'cast-rail'}>
      {people.map((c) => (
        <li key={c.id}>
          {c.imageUrl ? (
            <img src={c.imageUrl} alt="" />
          ) : (
            <span className="cast-ph" aria-hidden="true">
              {c.name.slice(0, 1)}
            </span>
          )}
          <span className="cast-name">
            {compact ? compactLabel(c) : c.name}
          </span>
          {!compact && c.character ? (
            <span className="cast-role">{c.character}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
