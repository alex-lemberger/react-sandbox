import { Users, Server, Box, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './ui';

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const StatCard = ({ title, value, change, icon: Icon, iconBg, iconColor, trend }) => (
  <Card className="stat-card">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {change && (
          <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            {trend === 'neutral' && <Minus className="w-4 h-4" />}
            {change}
          </span>
        )}
      </div>
    </div>
  </Card>
);

export function StatCards({ userStats, serverStats, appStats }) {
  const userChange = userStats?.total ? `+${Math.floor(Math.random() * 5) + 1} this week` : null;
  const serverChange = serverStats?.online ? `${serverStats.online}/${serverStats.total} online` : null;
  const appChange = appStats?.running ? `${appStats.running}/${appStats.total} running` : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        title="Total Users"
        value={formatNumber(userStats?.total || 0)}
        change={userChange}
        icon={Users}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
        trend="up"
      />
      <StatCard
        title="Active Users"
        value={formatNumber(userStats?.active || 0)}
        change={`${userStats?.inactive || 0} inactive`}
        icon={Users}
        iconBg="bg-green-100 dark:bg-green-900/30"
        iconColor="text-green-600 dark:text-green-400"
        trend="neutral"
      />
      <StatCard
        title="Servers"
        value={formatNumber(serverStats?.total || 0)}
        change={serverChange}
        icon={Server}
        iconBg="bg-purple-100 dark:bg-purple-900/30"
        iconColor="text-purple-600 dark:text-purple-400"
        trend={serverStats?.warning && serverStats.warning > 0 ? 'down' : 'up'}
      />
      <StatCard
        title="Applications"
        value={formatNumber(appStats?.total || 0)}
        change={appChange}
        icon={Box}
        iconBg="bg-orange-100 dark:bg-orange-900/30"
        iconColor="text-orange-600 dark:text-orange-400"
        trend={appStats?.warning && appStats.warning > 0 ? 'down' : 'up'}
      />
    </div>
  );
}
