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
  try {
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
      demoMode: false,
    };
  } catch (error) {
    console.warn('Using static demo data because the backend is unavailable.', error);
    return demoDashboardData;
  }
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

const demoUsersList = [
  { id: 1, username: 'admin', email: 'admin@appmanager.com', role: 'admin', status: 'active', created_at: '2024-01-10 08:00:00', last_login: '2024-01-15 10:30:00' },
  { id: 2, username: 'john_dev', email: 'john@appmanager.com', role: 'developer', status: 'active', created_at: '2024-01-10 09:00:00', last_login: '2024-01-15 09:15:00' },
  { id: 3, username: 'jane_ops', email: 'jane@appmanager.com', role: 'operator', status: 'active', created_at: '2024-01-10 10:00:00', last_login: '2024-01-15 08:45:00' },
  { id: 4, username: 'mike_qa', email: 'mike@appmanager.com', role: 'qa', status: 'inactive', created_at: '2024-01-11 08:00:00', last_login: '2024-01-14 16:20:00' },
  { id: 5, username: 'sarah_pm', email: 'sarah@appmanager.com', role: 'manager', status: 'active', created_at: '2024-01-11 09:00:00', last_login: '2024-01-15 11:00:00' },
  { id: 6, username: 'alex_sec', email: 'alex@appmanager.com', role: 'security', status: 'active', created_at: '2024-01-11 10:00:00', last_login: '2024-01-15 07:30:00' },
  { id: 7, username: 'lisa_ui', email: 'lisa@appmanager.com', role: 'designer', status: 'active', created_at: '2024-01-12 08:00:00', last_login: '2024-01-15 10:00:00' },
  { id: 8, username: 'tom_backend', email: 'tom@appmanager.com', role: 'developer', status: 'inactive', created_at: '2024-01-12 09:00:00', last_login: '2024-01-13 14:00:00' },
];

const demoServersList = [
  { id: 1, name: 'web-server-01', ip_address: '10.0.1.10', status: 'online', cpu_usage: 23.5, memory_usage: 45.2, disk_usage: 67.8, uptime: 864000, last_check: '2024-01-15 12:00:00', created_at: '2024-01-10 08:00:00' },
  { id: 2, name: 'api-server-01', ip_address: '10.0.1.11', status: 'online', cpu_usage: 67.3, memory_usage: 78.9, disk_usage: 45.1, uptime: 720000, last_check: '2024-01-15 12:00:00', created_at: '2024-01-10 08:15:00' },
  { id: 3, name: 'db-server-01', ip_address: '10.0.1.12', status: 'online', cpu_usage: 34.1, memory_usage: 56.7, disk_usage: 89.2, uptime: 950000, last_check: '2024-01-15 12:00:00', created_at: '2024-01-10 08:30:00' },
  { id: 4, name: 'cache-server-01', ip_address: '10.0.1.13', status: 'warning', cpu_usage: 89.5, memory_usage: 92.3, disk_usage: 23.4, uptime: 432000, last_check: '2024-01-15 12:00:00', created_at: '2024-01-10 08:45:00' },
  { id: 5, name: 'worker-server-01', ip_address: '10.0.1.14', status: 'offline', cpu_usage: 0, memory_usage: 0, disk_usage: 12.1, uptime: 0, last_check: '2024-01-15 10:00:00', created_at: '2024-01-10 09:00:00' },
  { id: 6, name: 'web-server-02', ip_address: '10.0.1.15', status: 'online', cpu_usage: 18.9, memory_usage: 34.5, disk_usage: 56.7, uptime: 604800, last_check: '2024-01-15 12:00:00', created_at: '2024-01-10 09:15:00' },
];

const demoAppsList = [
  { id: 1, name: 'User Portal', version: '2.4.1', description: 'Main customer-facing web portal', status: 'running', server_id: 1, server_name: 'web-server-01', server_ip: '10.0.1.10', created_at: '2024-01-10 10:00:00', updated_at: '2024-01-15 09:00:00' },
  { id: 2, name: 'Admin Dashboard', version: '1.8.3', description: 'Internal administration panel', status: 'running', server_id: 1, server_name: 'web-server-01', server_ip: '10.0.1.10', created_at: '2024-01-10 10:15:00', updated_at: '2024-01-15 09:10:00' },
  { id: 3, name: 'API Gateway', version: '3.2.0', description: 'REST API gateway and rate limiter', status: 'running', server_id: 2, server_name: 'api-server-01', server_ip: '10.0.1.11', created_at: '2024-01-10 10:30:00', updated_at: '2024-01-15 09:20:00' },
  { id: 4, name: 'Auth Service', version: '2.1.5', description: 'Authentication and authorization microservice', status: 'running', server_id: 2, server_name: 'api-server-01', server_ip: '10.0.1.11', created_at: '2024-01-10 10:45:00', updated_at: '2024-01-15 09:30:00' },
  { id: 5, name: 'Data Processor', version: '1.5.2', description: 'Background job processing service', status: 'running', server_id: 3, server_name: 'db-server-01', server_ip: '10.0.1.12', created_at: '2024-01-10 11:00:00', updated_at: '2024-01-15 09:40:00' },
  { id: 6, name: 'Notification Service', version: '2.0.1', description: 'Email and push notification service', status: 'warning', server_id: 4, server_name: 'cache-server-01', server_ip: '10.0.1.13', created_at: '2024-01-10 11:15:00', updated_at: '2024-01-15 09:50:00' },
  { id: 7, name: 'Analytics Engine', version: '1.3.0', description: 'Real-time analytics processing', status: 'stopped', server_id: 5, server_name: 'worker-server-01', server_ip: '10.0.1.14', created_at: '2024-01-10 11:30:00', updated_at: '2024-01-15 10:00:00' },
  { id: 8, name: 'Report Generator', version: '1.1.0', description: 'Automated report generation', status: 'running', server_id: 6, server_name: 'web-server-02', server_ip: '10.0.1.15', created_at: '2024-01-10 11:45:00', updated_at: '2024-01-15 10:10:00' },
];

const demoRecentLogs = [
  { id: 1, user_id: 1, username: 'admin', action: 'LOGIN', description: 'Admin user logged in', ip_address: '192.168.1.100', timestamp: '2024-01-15 12:00:00' },
  { id: 2, user_id: 2, username: 'john_dev', action: 'DEPLOY', description: 'Deployed User Portal v2.4.1 to web-server-01', ip_address: '192.168.1.101', timestamp: '2024-01-15 11:45:00' },
  { id: 3, user_id: 3, username: 'jane_ops', action: 'RESTART', description: 'Restarted API Gateway on api-server-01', ip_address: '192.168.1.102', timestamp: '2024-01-15 11:30:00' },
  { id: 4, user_id: 1, username: 'admin', action: 'CONFIG_CHANGE', description: 'Updated rate limiting rules for API Gateway', ip_address: '192.168.1.100', timestamp: '2024-01-15 11:15:00' },
  { id: 5, user_id: 4, username: 'mike_qa', action: 'LOGIN', description: 'QA user logged in', ip_address: '192.168.1.103', timestamp: '2024-01-15 11:00:00' },
  { id: 6, user_id: 5, username: 'sarah_pm', action: 'SCALE', description: 'Scaled Notification Service to 3 replicas', ip_address: '192.168.1.104', timestamp: '2024-01-15 10:45:00' },
  { id: 7, user_id: 6, username: 'alex_sec', action: 'SECURITY_ALERT', description: 'Detected suspicious login attempt', ip_address: '192.168.1.105', timestamp: '2024-01-15 10:30:00' },
  { id: 8, user_id: 7, username: 'lisa_ui', action: 'DEPLOY', description: 'Deployed Admin Dashboard v1.8.3 to web-server-01', ip_address: '192.168.1.106', timestamp: '2024-01-15 10:15:00' },
  { id: 9, user_id: 2, username: 'john_dev', action: 'LOGIN', description: 'Developer user logged in', ip_address: '192.168.1.101', timestamp: '2024-01-15 10:00:00' },
  { id: 10, user_id: 3, username: 'jane_ops', action: 'BACKUP', description: 'Initiated database backup on db-server-01', ip_address: '192.168.1.102', timestamp: '2024-01-15 09:45:00' },
];

const demoDashboardData = {
  users: {
    total: demoUsersList.length,
    active: demoUsersList.filter((user) => user.status === 'active').length,
    inactive: demoUsersList.filter((user) => user.status === 'inactive').length,
    byRole: Object.entries(
      demoUsersList.reduce((roles, user) => ({ ...roles, [user.role]: (roles[user.role] || 0) + 1 }), {}),
    ).map(([role, count]) => ({ role, count })),
    recentLogins: demoUsersList
      .filter((user) => user.last_login)
      .sort((left, right) => new Date(right.last_login) - new Date(left.last_login))
      .slice(0, 5)
      .map((user) => ({ username: user.username, last_login: user.last_login })),
  },
  servers: summarizeServers(demoServersList),
  apps: {
    total: demoAppsList.length,
    running: demoAppsList.filter((app) => app.status === 'running').length,
    warning: demoAppsList.filter((app) => app.status === 'warning').length,
    stopped: demoAppsList.filter((app) => app.status === 'stopped').length,
  },
  usersList: demoUsersList,
  serversList: demoServersList,
  appsList: demoAppsList,
  recentLogs: demoRecentLogs,
  demoMode: true,
};
