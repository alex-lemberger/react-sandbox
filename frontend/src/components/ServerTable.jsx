import { Server, Play, Square, RotateCcw, Cpu, HardDrive, MemoryStick, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, LoadingSpinner, EmptyState } from './ui';

const getStatusBadge = (status) => {
  switch (status) {
    case 'online':
      return <Badge variant="success"><Wifi className="w-3 h-3 mr-1" /> Online</Badge>;
    case 'warning':
      return <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" /> Warning</Badge>;
    case 'offline':
      return <Badge variant="danger"><WifiOff className="w-3 h-3 mr-1" /> Offline</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

const getUsageColor = (value) => {
  if (value >= 90) return 'text-red-600 dark:text-red-400';
  if (value >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

const formatUptime = (seconds) => {
  if (!seconds) return 'N/A';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export function ServerTable({ servers, onAction, title = 'Servers', showActions = true, loading = false }) {
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

  if (!servers || servers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            icon={Server}
            title="No servers found"
            description="No servers have been added to the system yet."
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
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{servers.length} servers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Server</TableHead>
              <TableHead className="hidden md:table-cell">IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">CPU</TableHead>
              <TableHead className="hidden lg:table-cell">Memory</TableHead>
              <TableHead className="hidden lg:table-cell">Disk</TableHead>
              <TableHead className="hidden xl:table-cell">Uptime</TableHead>
              {showActions && <TableHead className="w-32 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${server.status === 'online' ? 'bg-green-500' : server.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                    <span>{server.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-gray-500 dark:text-gray-400 font-mono text-xs">{server.ip_address}</TableCell>
                <TableCell>{getStatusBadge(server.status)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <span className={getUsageColor(server.cpu_usage)}>{server.cpu_usage}%</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-gray-400" />
                    <span className={getUsageColor(server.memory_usage)}>{server.memory_usage}%</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <span className={getUsageColor(server.disk_usage)}>{server.disk_usage}%</span>
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell text-gray-500 dark:text-gray-400">
                  {formatUptime(server.uptime)}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {server.status !== 'online' && (
                        <Button
                          variant="success"
                          size="icon"
                          onClick={() => onAction('start', server.id, server.name)}
                          title="Start server"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {server.status === 'online' && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => onAction('restart', server.id, server.name)}
                            title="Restart server"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="icon"
                            onClick={() => onAction('stop', server.id, server.name)}
                            title="Stop server"
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
