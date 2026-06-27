import { Clock, User, AlertCircle, GitBranch, Database, Server, Shield, RefreshCw, Wifi } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, LoadingSpinner, EmptyState } from './ui';

const getActionConfig = (action) => {
  switch (action) {
    case 'LOGIN':
      return { icon: User, badge: 'primary', label: 'Login', color: 'text-blue-600 dark:text-blue-400' };
    case 'DEPLOY':
      return { icon: GitBranch, badge: 'success', label: 'Deploy', color: 'text-green-600 dark:text-green-400' };
    case 'RESTART':
      return { icon: RefreshCw, badge: 'info', label: 'Restart', color: 'text-indigo-600 dark:text-indigo-400' };
    case 'CONFIG_CHANGE':
      return { icon: Shield, badge: 'warning', label: 'Config', color: 'text-yellow-600 dark:text-yellow-400' };
    case 'SCALE':
      return { icon: Server, badge: 'info', label: 'Scale', color: 'text-purple-600 dark:text-purple-400' };
    case 'SECURITY_ALERT':
      return { icon: AlertCircle, badge: 'danger', label: 'Security', color: 'text-red-600 dark:text-red-400' };
    case 'BACKUP':
      return { icon: Database, badge: 'default', label: 'Backup', color: 'text-gray-600 dark:text-gray-400' };
    default:
      return { icon: Wifi, badge: 'default', label: action, color: 'text-gray-600 dark:text-gray-400' };
  }
};

const formatRelativeTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function ActivityLog({ logs, loading = false }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={Clock}
            title="No activity logs"
            description="No recent activity has been recorded."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Activity Logs
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{logs.length} events</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map((log, index) => {
            const actionConfig = getActionConfig(log.action);
            const ActionIcon = actionConfig.icon;
            return (
              <div
                key={log.id || index}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ActionIcon className={`w-5 h-5 ${actionConfig.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 dark:text-white">{log.username || 'System'}</p>
                    <Badge variant={actionConfig.badge} className="gap-1.5">
                      <ActionIcon className="w-3 h-3" />
                      {actionConfig.label}
                    </Badge>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{formatRelativeTime(log.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{log.description || 'No description provided'}</p>
                  {log.ip_address && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{log.ip_address}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}