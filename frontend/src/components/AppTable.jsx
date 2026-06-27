import { Box, Play, Square, RotateCcw, Server, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, LoadingSpinner, EmptyState } from './ui';

const getStatusConfig = (status) => {
  switch (status) {
    case 'running':
      return { badge: 'success', icon: CheckCircle, label: 'Running', color: 'text-green-600 dark:text-green-400' };
    case 'warning':
      return { badge: 'warning', icon: AlertTriangle, label: 'Warning', color: 'text-yellow-600 dark:text-yellow-400' };
    case 'stopped':
      return { badge: 'danger', icon: XCircle, label: 'Stopped', color: 'text-red-600 dark:text-red-400' };
    default:
      return { badge: 'default', icon: AlertCircle, label: status, color: 'text-gray-600 dark:text-gray-400' };
  }
};

export function AppTable({ apps, onAction, title = 'Applications', showActions = true, loading = false }) {
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

  if (!apps || apps.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={Box}
            title="No applications found"
            description="No applications have been deployed yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{apps.length} apps</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Server</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              {showActions && <TableHead className="w-48 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => {
              const statusConfig = getStatusConfig(app.status);
              const StatusIcon = statusConfig.icon;
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{app.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{app.description || 'No description'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{app.version}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{app.server_name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={statusConfig.badge} className="gap-1.5">
                      <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status !== 'running' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => onAction('start', app.id, app.name)}
                            className="gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {app.status === 'running' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onAction('stop', app.id, app.name)}
                            className="gap-1.5"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onAction('restart', app.id, app.name)}
                          className="gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}