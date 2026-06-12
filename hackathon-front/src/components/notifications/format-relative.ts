/** Compact relative-time label (e.g. "just now", "5m ago", "3d ago") for notification feeds. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "just now";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Map the institution role (UPPERCASE on UserDto) to its dashboard route prefix. */
export function roleBasePath(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    default:
      return "/student";
  }
}

/** Resolve a notification's stored link to a concrete route for the current role. */
export function resolveNotificationLink(link: string | null, base: string): string {
  if (!link || link === "/notifications") return `${base}/notifications`;
  return link;
}
