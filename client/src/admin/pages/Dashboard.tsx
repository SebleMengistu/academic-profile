import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../../services/admin';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  BookOpen, DollarSign, Trophy, BookMarked, Image, Mail,
  Users, ArrowRight, Activity,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface StatsCard {
  label: string;
  value: number;
  icon: React.ElementType;
  href: string;
  color: string;
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboard,
    refetchInterval: 60_000,
  });

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  const stats = data?.stats;
  const activity = data?.recentActivity || [];

  const cards: StatsCard[] = [
    { label: 'Publications',     value: stats?.totalPublications ?? 0, icon: BookOpen,    href: '/admin/publications',    color: 'bg-blue-50 text-blue-600' },
    { label: 'Research Projects',value: stats?.fundedProjects ?? 0,    icon: DollarSign,  href: '/admin/funded-research', color: 'bg-green-50 text-green-600' },
    { label: 'Awards',           value: stats?.awards ?? 0,            icon: Trophy,      href: '/admin/awards',          color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Teaching Records', value: stats?.teachingRecords ?? 0,   icon: BookMarked,  href: '/admin/teaching',        color: 'bg-purple-50 text-purple-600' },
    { label: 'Media Items',      value: stats?.mediaItems ?? 0,        icon: Image,       href: '/admin/media',           color: 'bg-pink-50 text-pink-600' },
    { label: 'New Messages',     value: stats?.newMessages ?? 0,       icon: Mail,        href: '/admin/contact',         color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Users',      value: stats?.totalUsers ?? 0,        icon: Users,       href: '/admin/users',           color: 'bg-secondary-50 text-secondary-600' },
  ];

  const actionColors: Record<string, string> = {
    CREATE: 'badge-green',
    UPDATE: 'badge-blue',
    DELETE: 'badge-red',
    PUBLISH: 'badge-green',
    LOGIN: 'badge-gray',
    LOGOUT: 'badge-gray',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-500 text-sm mt-1">Overview of your academic profile content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} to={href} className="card p-4 hover:shadow-card-hover transition-shadow group">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold text-secondary-900 group-hover:text-primary-700 transition-colors">{value.toLocaleString()}</div>
            <div className="text-xs text-secondary-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publications by Year */}
        {data?.charts?.publicationsByYear?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" aria-hidden="true" />
              Publications by Year
            </h2>
            <div className="space-y-2">
              {data.charts.publicationsByYear.slice(0, 8).map((item: { _id: number; count: number }) => {
                const max = Math.max(...data.charts.publicationsByYear.map((d: { count: number }) => d.count));
                const pct = (item.count / max) * 100;
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className="text-xs text-secondary-500 w-10 text-right">{item._id}</span>
                    <div className="flex-1 bg-secondary-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-secondary-700 w-6">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Publication Types */}
        {data?.charts?.publicationTypes?.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" aria-hidden="true" />
              Publication Types
            </h2>
            <div className="space-y-2">
              {data.charts.publicationTypes.slice(0, 6).map((item: { _id: string; count: number }) => {
                const max = Math.max(...data.charts.publicationTypes.map((d: { count: number }) => d.count));
                const pct = (item.count / max) * 100;
                return (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className="text-xs text-secondary-500 w-28 truncate">{item._id}</span>
                    <div className="flex-1 bg-secondary-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-secondary-700 w-6">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-secondary-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-600" aria-hidden="true" />
              Recent Activity
            </h2>
            <Link to="/admin/audit-logs" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table" aria-label="Recent activity log">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((log: { _id: string; action: string; entity: string; entityId?: string; userEmail?: string; createdAt: string }) => (
                  <tr key={log._id}>
                    <td><span className={actionColors[log.action] ?? 'badge-gray'}>{log.action}</span></td>
                    <td className="text-secondary-700 text-xs">{log.entity}{log.entityId && ` #${log.entityId.slice(-6)}`}</td>
                    <td className="text-secondary-500 text-xs">{log.userEmail || 'System'}</td>
                    <td className="text-secondary-400 text-xs whitespace-nowrap">{formatDate(log.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/publications/new" className="btn-primary btn-sm">+ Add Publication</Link>
          <Link to="/admin/profile" className="btn-secondary btn-sm">Edit Profile</Link>
          <Link to="/admin/media" className="btn-secondary btn-sm">Manage Media</Link>
          <Link to="/admin/contact" className="btn-secondary btn-sm">View Messages {stats?.newMessages ? `(${stats.newMessages} new)` : ''}</Link>
        </div>
      </div>
    </div>
  );
}
