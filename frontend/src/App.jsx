import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  AppWindow,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Cpu,
  Database,
  HardDrive,
  Mail,
  Loader2,
  Menu,
  Moon,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Square,
  Sun,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import {
  fetchDashboardData,
  restartApp,
  restartServer,
  startApp,
  startServer,
  stopApp,
  stopServer,
} from './api';
import { useTheme } from './hooks/useTheme';

const routes = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'servers', label: 'Servers', icon: Server },
  { id: 'applications', label: 'Applications', icon: AppWindow },
  { id: 'logs', label: 'Logs', icon: Clock3 },
];

const statusStyles = {
  online: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  running: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  offline: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600',
  stopped: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
  active: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20',
  inactive: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600',
};

const actionIcons = {
  LOGIN: Users,
  DEPLOY: Zap,
  RESTART: RefreshCw,
  CONFIG_CHANGE: ShieldCheck,
  SCALE: Activity,
  SECURITY_ALERT: AlertTriangle,
  BACKUP: Database,
};

function App() {
  const { theme, toggleTheme } = useTheme();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('overview');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);

  const loadDashboard = async ({ quiet = false } = {}) => {
    try {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await fetchDashboardData();
      setDashboard(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const refreshTimer = window.setInterval(() => loadDashboard({ quiet: true }), 30000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2800);
  };

  const runAction = async (kind, action, item) => {
    const handlers = {
      server: { start: startServer, stop: stopServer, restart: restartServer },
      app: { start: startApp, stop: stopApp, restart: restartApp },
    };

    try {
      await handlers[kind][action](item.id);
      showToast(`${item.name} ${pastTense(action)} successfully.`);
      await loadDashboard({ quiet: true });
    } catch (err) {
      showToast(`Could not ${action} ${item.name}: ${err.message}`, 'error');
    }
  };

  const filteredApps = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return dashboard?.appsList || [];
    return (dashboard?.appsList || []).filter((app) =>
      [app.name, app.version, app.description, app.server_name, app.status].some((value) =>
        String(value || '').toLowerCase().includes(needle),
      ),
    );
  }, [dashboard, query]);

  if (loading) {
    return (
      <ScreenShell theme={theme}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-sky-600" />
            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">Loading dashboard data</p>
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (error && !dashboard) {
    return (
      <ScreenShell theme={theme}>
        <div className="flex min-h-screen items-center justify-center p-6">
          <section className="max-w-md rounded-lg border border-rose-200 bg-white p-6 text-center shadow-sm dark:border-rose-500/30 dark:bg-slate-900">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-600" />
            <h1 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">Backend connection failed</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error}</p>
            <button
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              onClick={() => loadDashboard()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </section>
        </div>
      </ScreenShell>
    );
  }

  const users = dashboard?.users || {};
  const servers = dashboard?.servers || {};
  const apps = dashboard?.apps || {};
  const usersList = dashboard?.usersList || [];
  const serverList = dashboard?.serversList || [];
  const recentLogs = dashboard?.recentLogs || [];
  const currentRoute = routes.find((route) => route.id === activeRoute) || routes[0];

  return (
    <ScreenShell theme={theme}>
      <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
        <Sidebar
          open={sidebarOpen}
          activeRoute={activeRoute}
          onRouteChange={setActiveRoute}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:hover:bg-slate-800 dark:hover:text-white"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">Operations</p>
                  <h1 className="text-lg font-semibold sm:text-xl">{currentRoute.label}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => loadDashboard({ quiet: true })}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Alerts">
                  <Bell className="h-5 w-5" />
                  {(servers.warning || apps.warning) > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />}
                </button>
                <button
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <RouteContent
              route={activeRoute}
              users={users}
              usersList={usersList}
              servers={servers}
              serverList={serverList}
              apps={apps}
              filteredApps={filteredApps}
              recentLogs={recentLogs}
              query={query}
              setQuery={setQuery}
              onServerAction={(action, server) => runAction('server', action, server)}
              onAppAction={(action, app) => runAction('app', action, app)}
            />
          </main>
        </div>

        {toast && <Toast tone={toast.tone} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </ScreenShell>
  );
}

function ScreenShell({ theme, children }) {
  return <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>;
}

function Sidebar({ open, activeRoute, onRouteChange, onClose }) {
  return (
    <>
      <div className={`fixed inset-0 z-40 bg-slate-950/50 lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 dark:border-slate-800 dark:bg-slate-950 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">AppManager</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production Control</p>
            </div>
          </div>
          <button className="rounded-md p-2 text-slate-500 lg:hidden" onClick={onClose} aria-label="Close navigation">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {routes.map((item) => (
            <button
              key={item.id}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${activeRoute === item.id ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'}`}
              onClick={() => {
                onRouteChange(item.id);
                onClose();
              }}
              type="button"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-900">
            <p className="text-sm font-medium">Backend</p>
            <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">http://localhost:3001</p>
          </div>
        </div>
      </aside>
    </>
  );
}

function RouteContent({
  route,
  users,
  usersList,
  servers,
  serverList,
  apps,
  filteredApps,
  recentLogs,
  query,
  setQuery,
  onServerAction,
  onAppAction,
}) {
  if (route === 'users') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Total users" value={users.total || 0} detail={`${users.active || 0} active accounts`} icon={Users} tone="sky" />
          <MetricCard title="Inactive users" value={users.inactive || 0} detail="Accounts currently disabled" icon={WifiOff} tone="amber" />
          <MetricCard title="Roles" value={(users.byRole || []).length} detail="Permission groups in use" icon={ShieldCheck} tone="violet" />
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Role Distribution" subtitle="User count by operational role">
            <RoleChart roles={users.byRole || []} total={users.total || 0} />
          </Panel>
          <Panel title="User Directory" subtitle="Seeded user accounts from the backend">
            <UserTable users={usersList} />
          </Panel>
        </section>
        <Panel title="Recent Logins" subtitle="Most recent authenticated users">
          <RecentLogins logins={users.recentLogins || []} />
        </Panel>
      </div>
    );
  }

  if (route === 'servers') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Servers online" value={`${servers.online || 0}/${servers.total || 0}`} detail={`${servers.warning || 0} warning, ${servers.offline || 0} offline`} icon={Server} tone="emerald" />
          <MetricCard title="Average CPU" value={`${servers.avgCpu || 0}%`} detail="Excludes offline servers" icon={Cpu} tone="sky" />
          <MetricCard title="Average memory" value={`${servers.avgMemory || 0}%`} detail="Current active-server load" icon={CircleGauge} tone="violet" />
          <MetricCard title="Average disk" value={`${servers.avgDisk || 0}%`} detail="Provisioned disk usage" icon={HardDrive} tone="amber" />
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Infrastructure Load" subtitle="Average server utilization">
            <ResourceBars servers={servers} />
          </Panel>
          <Panel title="Status Mix" subtitle="Fleet health by state">
            <ServerStatusChart servers={servers} />
          </Panel>
        </section>
        <Panel title="Server Fleet" subtitle="Every server with controls and pressure indicators">
          <ServerFleet servers={serverList} onAction={onServerAction} />
        </Panel>
      </div>
    );
  }

  if (route === 'applications') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Applications" value={apps.total || 0} detail={`${apps.running || 0} running services`} icon={AppWindow} tone="violet" />
          <MetricCard title="Warnings" value={apps.warning || 0} detail="Apps needing attention" icon={AlertTriangle} tone="amber" />
          <MetricCard title="Stopped" value={apps.stopped || 0} detail="Inactive deployments" icon={Square} tone="sky" />
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <Panel title="Application Status" subtitle="Running, warning, and stopped deployments">
            <AppStatusChart apps={apps} />
          </Panel>
          <Panel
            title="Applications"
            subtitle="Searchable deployment inventory"
            action={<AppSearch query={query} setQuery={setQuery} />}
          >
            <ApplicationTable apps={filteredApps} onAction={onAppAction} />
          </Panel>
        </section>
      </div>
    );
  }

  if (route === 'logs') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard title="Audit events" value={recentLogs.length} detail="Loaded from activity logs" icon={Clock3} tone="sky" />
          <MetricCard title="Deployments" value={recentLogs.filter((log) => log.action === 'DEPLOY').length} detail="Recent deployment events" icon={Zap} tone="emerald" />
          <MetricCard title="Security" value={recentLogs.filter((log) => log.action === 'SECURITY_ALERT').length} detail="Security alert events" icon={ShieldCheck} tone="amber" />
        </section>
        <Panel title="Server Logs" subtitle="Audit trail from backend activity_logs">
          <ActivityFeed logs={recentLogs} expanded />
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total users" value={users.total || 0} detail={`${users.active || 0} active accounts`} icon={Users} tone="sky" />
        <MetricCard title="Servers online" value={`${servers.online || 0}/${servers.total || 0}`} detail={`${servers.warning || 0} warning, ${servers.offline || 0} offline`} icon={Server} tone="emerald" />
        <MetricCard title="Running apps" value={`${apps.running || 0}/${apps.total || 0}`} detail={`${apps.warning || 0} warning, ${apps.stopped || 0} stopped`} icon={AppWindow} tone="violet" />
        <MetricCard title="Avg resource load" value={`${averageLoad(servers)}%`} detail={`CPU ${servers.avgCpu || 0}% | Mem ${servers.avgMemory || 0}% | Disk ${servers.avgDisk || 0}%`} icon={CircleGauge} tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Infrastructure Load" subtitle="Average server utilization from the seeded SQLite backend">
          <ResourceBars servers={servers} />
        </Panel>
        <Panel title="User Roles" subtitle="Account distribution by role">
          <RoleChart roles={users.byRole || []} total={users.total || 0} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Server Fleet" subtitle="Live status and resource pressure">
          <ServerFleet servers={serverList} onAction={onServerAction} />
        </Panel>
        <Panel
          title="Applications"
          subtitle="Searchable deployment inventory"
          action={<AppSearch query={query} setQuery={setQuery} />}
        >
          <ApplicationTable apps={filteredApps} onAction={onAppAction} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Status Mix" subtitle="Servers and apps by operating state">
          <StatusChart servers={servers} apps={apps} />
        </Panel>
        <Panel title="Server Logs" subtitle="Recent backend activity and audit events">
          <ActivityFeed logs={recentLogs.slice(0, 10)} />
        </Panel>
      </section>
    </div>
  );
}

function AppSearch({ query, setQuery }) {
  return (
    <label className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        className="w-full min-w-0 bg-transparent text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search apps"
      />
    </label>
  );
}

function MetricCard({ title, value, detail, icon: Icon, tone }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ResourceBars({ servers }) {
  const rows = [
    { label: 'CPU', value: servers.avgCpu || 0, icon: Cpu, color: 'bg-sky-500' },
    { label: 'Memory', value: servers.avgMemory || 0, icon: CircleGauge, color: 'bg-violet-500' },
    { label: 'Disk', value: servers.avgDisk || 0, icon: HardDrive, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-5">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <row.icon className="h-4 w-4 text-slate-400" />
              {row.label}
            </span>
            <span className="font-semibold">{row.value}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.min(row.value, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleChart({ roles, total }) {
  return (
    <div className="space-y-3">
      {roles.map((role) => {
        const percent = total ? Math.round((role.count / total) * 100) : 0;
        return (
          <div key={role.role} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="truncate font-medium capitalize">{role.role}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-sky-500" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-right text-slate-500 dark:text-slate-400">{role.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function UserTable({ users }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <tr>
            <th className="pb-3 font-semibold">User</th>
            <th className="pb-3 font-semibold">Role</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Last Login</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{user.username}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      <Mail className="h-3.5 w-3.5" />
                      {user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {user.role}
                </span>
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={user.status} />
              </td>
              <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{formatDate(user.last_login)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentLogins({ logins }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {logins.map((login) => (
        <article key={`${login.username}-${login.last_login}`} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{login.username}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(login.last_login)}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ServerFleet({ servers, onAction }) {
  return (
    <div className="space-y-3">
      {servers.map((server) => (
        <div key={server.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{server.name}</h3>
                <StatusBadge status={server.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{server.ip_address}</p>
            </div>
            <ActionButtons item={server} mode="server" onAction={onAction} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <MiniGauge label="CPU" value={server.cpu_usage} />
            <MiniGauge label="Mem" value={server.memory_usage} />
            <MiniGauge label="Disk" value={server.disk_usage} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ServerStatusChart({ servers }) {
  return (
    <StackedStatus
      rows={[
        { label: 'Online', value: servers.online || 0, total: servers.total || 0, color: 'bg-emerald-500' },
        { label: 'Warning', value: servers.warning || 0, total: servers.total || 0, color: 'bg-amber-500' },
        { label: 'Offline', value: servers.offline || 0, total: servers.total || 0, color: 'bg-slate-500' },
      ]}
    />
  );
}

function AppStatusChart({ apps }) {
  return (
    <StackedStatus
      rows={[
        { label: 'Running', value: apps.running || 0, total: apps.total || 0, color: 'bg-emerald-500' },
        { label: 'Warning', value: apps.warning || 0, total: apps.total || 0, color: 'bg-amber-500' },
        { label: 'Stopped', value: apps.stopped || 0, total: apps.total || 0, color: 'bg-rose-500' },
      ]}
    />
  );
}

function StackedStatus({ rows }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const percent = row.total ? Math.round((row.value / row.total) * 100) : 0;
        return (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{row.label}</span>
              <span className="text-slate-500 dark:text-slate-400">{row.value} / {row.total}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full rounded-full ${row.color}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ApplicationTable({ apps, onAction }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <tr>
            <th className="pb-3 font-semibold">Application</th>
            <th className="pb-3 font-semibold">Version</th>
            <th className="pb-3 font-semibold">Server</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {apps.map((app) => (
            <tr key={app.id}>
              <td className="py-3 pr-4">
                <p className="font-medium">{app.name}</p>
                <p className="mt-1 max-w-sm truncate text-xs text-slate-500 dark:text-slate-400">{app.description}</p>
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-slate-600 dark:text-slate-300">{app.version}</td>
              <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{app.server_name}</td>
              <td className="py-3 pr-4"><StatusBadge status={app.status} /></td>
              <td className="py-3 text-right"><ActionButtons item={app} mode="app" onAction={onAction} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusChart({ servers, apps }) {
  const rows = [
    { label: 'Servers online', value: servers.online || 0, total: servers.total || 0, color: '#10b981' },
    { label: 'Server warnings', value: servers.warning || 0, total: servers.total || 0, color: '#f59e0b' },
    { label: 'Apps running', value: apps.running || 0, total: apps.total || 0, color: '#8b5cf6' },
    { label: 'App warnings', value: apps.warning || 0, total: apps.total || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const height = row.total ? Math.max(12, (row.value / row.total) * 136) : 12;
        return (
          <div key={row.label} className="grid grid-cols-[8rem_1fr_3rem] items-end gap-3">
            <span className="pb-1 text-sm text-slate-600 dark:text-slate-300">{row.label}</span>
            <div className="flex h-36 items-end rounded-md bg-slate-100 px-3 dark:bg-slate-800">
              <div className="w-full rounded-t-md" style={{ height, backgroundColor: row.color }} />
            </div>
            <span className="pb-1 text-right text-sm font-semibold">{row.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function ActivityFeed({ logs, expanded = false }) {
  return (
    <div className={`${expanded ? 'max-h-none' : 'max-h-[31rem] overflow-y-auto pr-1 scrollbar-thin'} space-y-3`}>
      {logs.map((log) => {
        const Icon = actionIcons[log.action] || Activity;
        return (
          <article key={log.id} className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{log.username || 'System'}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{log.action.replaceAll('_', ' ')}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{log.description}</p>
              <p className="mt-2 font-mono text-xs text-slate-400">{formatDate(log.timestamp)} | {log.ip_address}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const Icon = status === 'online' || status === 'running' || status === 'active' ? Wifi : status === 'warning' ? AlertTriangle : WifiOff;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[status] || statusStyles.offline}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function ActionButtons({ item, mode, onAction }) {
  const isRunning = mode === 'server' ? item.status === 'online' : item.status === 'running';
  return (
    <div className="inline-flex items-center justify-end gap-1">
      {!isRunning && (
        <IconButton label={`Start ${item.name}`} onClick={() => onAction('start', item)} tone="success">
          <Play className="h-4 w-4" />
        </IconButton>
      )}
      {isRunning && (
        <IconButton label={`Stop ${item.name}`} onClick={() => onAction('stop', item)} tone="danger">
          <Square className="h-4 w-4" />
        </IconButton>
      )}
      <IconButton label={`Restart ${item.name}`} onClick={() => onAction('restart', item)}>
        <RefreshCw className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

function IconButton({ label, tone = 'default', children, onClick }) {
  const classes = {
    default: 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
    success: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/10',
    danger: 'border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10',
  };
  return (
    <button className={`rounded-md border p-2 transition ${classes[tone]}`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function MiniGauge({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${value >= 85 ? 'bg-rose-500' : value >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function Toast({ tone, message, onClose }) {
  const isError = tone === 'error';
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`flex min-w-72 max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg dark:bg-slate-900 ${isError ? 'border-rose-200 dark:border-rose-500/30' : 'border-emerald-200 dark:border-emerald-500/30'}`}>
        {isError ? <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" /> : <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
        <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
        <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100" onClick={onClose} aria-label="Dismiss notification">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function averageLoad(servers) {
  const values = [servers.avgCpu, servers.avgMemory, servers.avgDisk].filter((value) => Number.isFinite(value));
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function pastTense(action) {
  if (action === 'stop') return 'stopped';
  if (action === 'start') return 'started';
  return 'restarted';
}

export default App;
