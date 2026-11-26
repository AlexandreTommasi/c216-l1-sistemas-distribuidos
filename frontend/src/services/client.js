const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function request(method, path, body) {
  const options = {
    method,
    headers: {},
  };

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, options);

  if (res.status === 204) return null;

  if (!res.ok) {
    const detail = await res
      .json()
      .then((d) => d.detail ?? `${res.status} ${res.statusText}`)
      .catch(() => `${res.status} ${res.statusText}`);
    throw new Error(detail);
  }

  return res.json();
}

export const get = (path) => request('GET', path);
export const post = (path, body) => request('POST', path, body);
export const patch = (path, body) => request('PATCH', path, body);
export const del = (path) => request('DELETE', path);
