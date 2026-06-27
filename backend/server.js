const express = require('express');
const cors = require('cors');
const { db, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/stats/users', (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get().count;
    const inactiveUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'inactive'").get().count;
    const usersByRole = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();
    const recentLogins = db.prepare('SELECT username, last_login FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC LIMIT 5').all();

    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      byRole: usersByRole,
      recentLogins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/servers', (req, res) => {
  try {
    const totalServers = db.prepare('SELECT COUNT(*) as count FROM servers').get().count;
    const onlineServers = db.prepare("SELECT COUNT(*) as count FROM servers WHERE status = 'online'").get().count;
    const warningServers = db.prepare("SELECT COUNT(*) as count FROM servers WHERE status = 'warning'").get().count;
    const offlineServers = db.prepare("SELECT COUNT(*) as count FROM servers WHERE status = 'offline'").get().count;
    const avgCpu = db.prepare('SELECT AVG(cpu_usage) as avg FROM servers WHERE status != "offline"').get().avg || 0;
    const avgMemory = db.prepare('SELECT AVG(memory_usage) as avg FROM servers WHERE status != "offline"').get().avg || 0;
    const avgDisk = db.prepare('SELECT AVG(disk_usage) as avg FROM servers WHERE status != "offline"').get().avg || 0;

    res.json({
      total: totalServers,
      online: onlineServers,
      warning: warningServers,
      offline: offlineServers,
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgMemory: Math.round(avgMemory * 10) / 10,
      avgDisk: Math.round(avgDisk * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/apps', (req, res) => {
  try {
    const totalApps = db.prepare('SELECT COUNT(*) as count FROM apps').get().count;
    const runningApps = db.prepare("SELECT COUNT(*) as count FROM apps WHERE status = 'running'").get().count;
    const warningApps = db.prepare("SELECT COUNT(*) as count FROM apps WHERE status = 'warning'").get().count;
    const stoppedApps = db.prepare("SELECT COUNT(*) as count FROM apps WHERE status = 'stopped'").get().count;

    res.json({
      total: totalApps,
      running: runningApps,
      warning: warningApps,
      stopped: stoppedApps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/servers', (req, res) => {
  try {
    const servers = db.prepare('SELECT * FROM servers ORDER BY created_at DESC').all();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/servers/:id', (req, res) => {
  try {
    const server = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    res.json(server);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/servers/:id', (req, res) => {
  try {
    const { name, ip_address, status, cpu_usage, memory_usage, disk_usage } = req.body;
    const stmt = db.prepare(`
      UPDATE servers 
      SET name = ?, ip_address = ?, status = ?, cpu_usage = ?, memory_usage = ?, disk_usage = ?, last_check = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(name, ip_address, status, cpu_usage, memory_usage, disk_usage, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    const updated = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/servers/:id/start', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE servers SET status = ?, last_check = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run('online', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    const updated = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/servers/:id/stop', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE servers SET status = ?, last_check = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run('offline', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    const updated = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/servers/:id/restart', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE servers SET status = ?, last_check = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run('offline', req.params.id);
    const result = stmt.run('online', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Server not found' });
    }
    const updated = db.prepare('SELECT * FROM servers WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/apps', (req, res) => {
  try {
    const apps = db.prepare(`
      SELECT a.*, s.name as server_name, s.ip_address as server_ip
      FROM apps a
      LEFT JOIN servers s ON a.server_id = s.id
      ORDER BY a.created_at DESC
    `).all();
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/apps/:id', (req, res) => {
  try {
    const app = db.prepare(`
      SELECT a.*, s.name as server_name, s.ip_address as server_ip
      FROM apps a
      LEFT JOIN servers s ON a.server_id = s.id
      WHERE a.id = ?
    `).get(req.params.id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apps', (req, res) => {
  try {
    const { name, version, description, status, server_id } = req.body;
    const stmt = db.prepare('INSERT INTO apps (name, version, description, status, server_id) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(name, version, description, status || 'stopped', server_id);
    const newApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newApp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/apps/:id', (req, res) => {
  try {
    const { name, version, description, status, server_id } = req.body;
    const stmt = db.prepare(`
      UPDATE apps 
      SET name = ?, version = ?, description = ?, status = ?, server_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(name, version, description, status, server_id, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    const updated = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/apps/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM apps WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apps/:id/start', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE apps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run('running', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    const updated = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apps/:id/stop', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE apps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run('stopped', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    const updated = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/apps/:id/restart', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE apps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run('stopped', req.params.id);
    const result = stmt.run('running', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    const updated = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, email, role, status, created_at, last_login FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/activity-logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const logs = db.prepare(`
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count;
    res.json({ logs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activity-logs', (req, res) => {
  try {
    const { user_id, action, description, ip_address } = req.body;
    const stmt = db.prepare('INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)');
    const result = stmt.run(user_id, action, description, ip_address);
    const newLog = db.prepare(`
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/summary', (req, res) => {
  try {
    const userStats = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active FROM users').get();
    const serverStats = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status = "online" THEN 1 ELSE 0 END) as online, SUM(CASE WHEN status = "warning" THEN 1 ELSE 0 END) as warning FROM servers').get();
    const appStats = db.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN status = "running" THEN 1 ELSE 0 END) as running, SUM(CASE WHEN status = "warning" THEN 1 ELSE 0 END) as warning FROM apps').get();
    const recentLogs = db.prepare(`
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 10
    `).all();
    const servers = db.prepare('SELECT * FROM servers ORDER BY status DESC, name ASC').all();
    const apps = db.prepare(`
      SELECT a.*, s.name as server_name
      FROM apps a
      LEFT JOIN servers s ON a.server_id = s.id
      ORDER BY a.status DESC, a.name ASC
    `).all();

    res.json({
      users: userStats,
      servers: serverStats,
      apps: appStats,
      recentLogs,
      serversList: servers,
      appsList: apps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});