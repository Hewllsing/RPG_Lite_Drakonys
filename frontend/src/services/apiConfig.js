const configuredApiUrl =
  import.meta.env.VITE_API_BASE_URL || '';

const normalizedApiUrl =
  configuredApiUrl.replace(/\/$/, '');

export function apiUrl(path) {

  const normalizedPath =
    path.startsWith('/') ? path : `/${path}`;

  return `${normalizedApiUrl}${normalizedPath}`;
}
