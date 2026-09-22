import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminGetAuditLogs } from '../../services/admin';
import AdminPageHeader from '../components/AdminPageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { FileText } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'badge-green', UPDATE: 'badge-blue', DELETE: 'badge-red',
  PUBLISH: 'badge-green', UNPUBLISH: 'badge-yellow', ARCHIVE: 'badge-gray',
  RESTORE: 'badge-blue', LOGIN: 'badge-gray', LOGOUT: 'badge-gray', FAILED_LOGIN: 'badge-red',
};

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => adminGetAuditLogs({ page, limit: 30 }),
    placeholderData: (prev) => prev,
  });

  return (
    <div>
      <AdminPageHeader title="Audit Logs" subtitle="Track all administrative actions" />
      {isLoading ? <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      : !data?.data?.length ? <EmptyState icon={FileText} title="No audit logs yet" />
      : (
        <>
          <div className="table-wrapper">
            <table className="table" aria-label="Audit logs">
              <thead><tr><th>Action</th><th>Entity</th><th>User</th><th>IP</th><th>Time</th></tr></thead>
              <tbody>
                {data.data.map((log: any) => (
                  <tr key={log._id}>
                    <td><span className={ACTION_COLORS[log.action] ?? 'badge-gray'}>{log.action}</span></td>
                    <td className="text-xs text-secondary-700">{log.entity}{log.entityId && <span className="text-secondary-400"> #{log.entityId.slice(-6)}</span>}</td>
                    <td className="text-xs text-secondary-600">{log.userEmail || 'System'}</td>
                    <td className="text-xs text-secondary-400">{log.ipAddress || '—'}</td>
                    <td className="text-xs text-secondary-400 whitespace-nowrap">{formatDate(log.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && <Pagination pagination={data.pagination} onChange={setPage} />}
        </>
      )}
    </div>
  );
}
