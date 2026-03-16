const BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  getListings: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/listings?${qs}`);
  },
  getHotListings: () => request('/listings/hot'),
  getLatestListings: () => request('/listings/latest'),
  getStats: () => request('/listings/stats'),
  getSubjects: () => request('/listings/subjects'),
  getLocations: () => request('/listings/locations'),
  getListing: (id) => request(`/listings/${id}`),
  applyListing: (id, message) => request(`/listings/${id}/apply`, { method: 'POST', body: JSON.stringify({ message }) }),
  getApplication: (id) => request(`/listings/${id}/application`),

  getSchools: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/schools?${qs}`);
  },
  getSchool: (id) => request(`/schools/${id}`),
};
