const API_BASE = 'http://localhost:3001/api';

async function fetchJson(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function fetchDashboardData() {
  const [users, apps, usersList, serversList, appsList, activityLogResult] = await Promise.all([
    fetchUserStats(),
    fetchAppStats(),
    fetchUsers(),
    fetchServers(),
    fetchApps(),
    fetchActivityLogs({ limit: 50 }),
  ]);

  return {
    users,
    servers: summarizeServers(serversList),
    apps,
    usersList,
    serversList,
    appsList,
    recentLogs: activityLogResult.logs || [],
  };
}

function summarizeServers(servers) {
  const activeServers = servers.filter((server) => server.status !== 'offline');
  const average = (field) => {
    if (!activeServers.length) return 0;
    const total = activeServers.reduce((sum, server) => sum + Number(server[field] || 0), 0);
    return Math.round((total / activeServers.length) * 10) / 10;
  };

  return {
    total: servers.length,
    online: servers.filter((server) => server.status === 'online').length,
    warning: servers.filter((server) => server.status === 'warning').length,
    offline: servers.filter((server) => server.status === 'offline').length,
    avgCpu: average('cpu_usage'),
    avgMemory: average('memory_usage'),
    avgDisk: average('disk_usage'),
  };
}

export async function fetchUserStats() {
  return fetchJson('/stats/users');
}

export async function fetchServerStats() {
  return fetchJson('/stats/servers');
}

export async function fetchAppStats() {
  return fetchJson('/stats/apps');
}

export async function fetchServers() {
  return fetchJson('/servers');
}

export async function fetchServer(id) {
  return fetchJson(`/servers/${id}`);
}

export async function updateServer(id, data) {
  return fetchJson(`/servers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function startServer(id) {
  return fetchJson(`/servers/${id}/start`, { method: 'POST' });
}

export async function stopServer(id) {
  return fetchJson(`/servers/${id}/stop`, { method: 'POST' });
}

export async function restartServer(id) {
  return fetchJson(`/servers/${id}/restart`, { method: 'POST' });
}

export async function fetchApps() {
  return fetchJson('/apps');
}

export async function fetchApp(id) {
  return fetchJson(`/apps/${id}`);
}

export async function createApp(data) {
  return fetchJson('/apps', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateApp(id, data) {
  return fetchJson(`/apps/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteApp(id) {
  return fetchJson(`/apps/${id}`, { method: 'DELETE' });
}

export async function startApp(id) {
  return fetchJson(`/apps/${id}/start`, { method: 'POST' });
}

export async function stopApp(id) {
  return fetchJson(`/apps/${id}/stop`, { method: 'POST' });
}

export async function restartApp(id) {
  return fetchJson(`/apps/${id}/restart`, { method: 'POST' });
}

export async function fetchUsers() {
  return fetchJson('/users');
}

export async function fetchActivityLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchJson(`/activity-logs${query ? `?${query}` : ''}`);
}

export async function createActivityLog(data) {
  return fetchJson('/activity-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function healthCheck() {
  return fetchJson('/health');
}
