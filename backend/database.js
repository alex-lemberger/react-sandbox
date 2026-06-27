const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS servers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'offline',
      cpu_usage REAL DEFAULT 0,
      memory_usage REAL DEFAULT 0,
      disk_usage REAL DEFAULT 0,
      uptime INTEGER DEFAULT 0,
      last_check DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      description TEXT,
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'stopped',
      server_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (server_id) REFERENCES servers(id)
    );
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare('INSERT INTO users (username, email, role, status, last_login) VALUES (?, ?, ?, ?, ?)');
    const users = [
      ['admin', 'admin@appmanager.com', 'admin', 'active', '2024-01-15 10:30:00'],
      ['john_dev', 'john@appmanager.com', 'developer', 'active', '2024-01-15 09:15:00'],
      ['jane_ops', 'jane@appmanager.com', 'operator', 'active', '2024-01-15 08:45:00'],
      ['mike_qa', 'mike@appmanager.com', 'qa', 'inactive', '2024-01-14 16:20:00'],
      ['sarah_pm', 'sarah@appmanager.com', 'manager', 'active', '2024-01-15 11:00:00'],
      ['alex_sec', 'alex@appmanager.com', 'security', 'active', '2024-01-15 07:30:00'],
      ['lisa_ui', 'lisa@appmanager.com', 'designer', 'active', '2024-01-15 10:00:00'],
      ['tom_backend', 'tom@appmanager.com', 'developer', 'inactive', '2024-01-13 14:00:00'],
    ];
    const insertMany = db.transaction((users) => {
      for (const user of users) {
        insertUser.run(...user);
      }
    });
    insertMany(users);
  }

  const serverCount = db.prepare('SELECT COUNT(*) as count FROM servers').get().count;
  if (serverCount === 0) {
    const insertServer = db.prepare('INSERT INTO servers (name, ip_address, status, cpu_usage, memory_usage, disk_usage, uptime, last_check) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const servers = [
      ['web-server-01', '10.0.1.10', 'online', 23.5, 45.2, 67.8, 864000, '2024-01-15 12:00:00'],
      ['api-server-01', '10.0.1.11', 'online', 67.3, 78.9, 45.1, 720000, '2024-01-15 12:00:00'],
      ['db-server-01', '10.0.1.12', 'online', 34.1, 56.7, 89.2, 950000, '2024-01-15 12:00:00'],
      ['cache-server-01', '10.0.1.13', 'warning', 89.5, 92.3, 23.4, 432000, '2024-01-15 12:00:00'],
      ['worker-server-01', '10.0.1.14', 'offline', 0, 0, 12.1, 0, '2024-01-15 10:00:00'],
      ['web-server-02', '10.0.1.15', 'online', 18.9, 34.5, 56.7, 604800, '2024-01-15 12:00:00'],
    ];
    const insertMany = db.transaction((servers) => {
      for (const server of servers) {
        insertServer.run(...server);
      }
    });
    insertMany(servers);
  }

  const appCount = db.prepare('SELECT COUNT(*) as count FROM apps').get().count;
  if (appCount === 0) {
    const insertApp = db.prepare('INSERT INTO apps (name, version, description, status, server_id) VALUES (?, ?, ?, ?, ?)');
    const apps = [
      ['User Portal', '2.4.1', 'Main customer-facing web portal', 'running', 1],
      ['Admin Dashboard', '1.8.3', 'Internal administration panel', 'running', 1],
      ['API Gateway', '3.2.0', 'REST API gateway and rate limiter', 'running', 2],
      ['Auth Service', '2.1.5', 'Authentication and authorization microservice', 'running', 2],
      ['Data Processor', '1.5.2', 'Background job processing service', 'running', 3],
      ['Notification Service', '2.0.1', 'Email and push notification service', 'warning', 4],
      ['Analytics Engine', '1.3.0', 'Real-time analytics processing', 'stopped', 5],
      ['Report Generator', '1.1.0', 'Automated report generation', 'running', 6],
    ];
    const insertMany = db.transaction((apps) => {
      for (const app of apps) {
        insertApp.run(...app);
      }
    });
    insertMany(apps);
  }

  const logCount = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count;
  if (logCount === 0) {
    const insertLog = db.prepare('INSERT INTO activity_logs (user_id, action, description, ip_address, timestamp) VALUES (?, ?, ?, ?, ?)');
    const logs = [
      [1, 'LOGIN', 'Admin user logged in', '192.168.1.100', '2024-01-15 12:00:00'],
      [2, 'DEPLOY', 'Deployed User Portal v2.4.1 to web-server-01', '192.168.1.101', '2024-01-15 11:45:00'],
      [3, 'RESTART', 'Restarted API Gateway on api-server-01', '192.168.1.102', '2024-01-15 11:30:00'],
      [1, 'CONFIG_CHANGE', 'Updated rate limiting rules for API Gateway', '192.168.1.100', '2024-01-15 11:15:00'],
      [4, 'LOGIN', 'QA user logged in', '192.168.1.103', '2024-01-15 11:00:00'],
      [5, 'SCALE', 'Scaled Notification Service to 3 replicas', '192.168.1.104', '2024-01-15 10:45:00'],
      [6, 'SECURITY_ALERT', 'Detected suspicious login attempt', '192.168.1.105', '2024-01-15 10:30:00'],
      [7, 'DEPLOY', 'Deployed Admin Dashboard v1.8.3 to web-server-01', '192.168.1.106', '2024-01-15 10:15:00'],
      [2, 'LOGIN', 'Developer user logged in', '192.168.1.101', '2024-01-15 10:00:00'],
      [3, 'BACKUP', 'Initiated database backup on db-server-01', '192.168.1.102', '2024-01-15 09:45:00'],
    ];
    const insertMany = db.transaction((logs) => {
      for (const log of logs) {
        insertLog.run(...log);
      }
    });
    insertMany(logs);
  }

  console.log('Database initialized and seeded successfully');
  return db;
}

module.exports = { db, initializeDatabase };