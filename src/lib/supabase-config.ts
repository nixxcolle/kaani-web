// The SDK appends /rest/v1 and /auth/v1 itself.
export function projectUrl(value: string): string {
  const url = new URL(value.trim());
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || !['/', '/rest/v1', '/rest/v1/'].includes(url.pathname)) {
    throw new Error('Use the Supabase project URL, without API paths or credentials.');
  }
  return url.origin;
}
