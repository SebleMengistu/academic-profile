import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/admin';
import { useAuthStore } from '../../store/authStore';
import { Menu, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onMenuClick: () => void;
}

export default function AdminTopbar({ onMenuClick }: Props) {
  const navigate = useNavigate();
  const { user, logout: storeLogout } = useAuthStore();
  const queryClient = useQueryClient();

  const { mutate: doLogout } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
      navigate('/admin/login');
    },
    onError: () => toast.error('Logout failed'),
  });

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-secondary-100 flex items-center justify-between h-14 px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="btn-ghost btn-icon lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="lg:hidden" />

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:flex flex-col items-end text-right">
          <p className="text-sm font-medium text-secondary-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-secondary-400">{user?.role}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" aria-hidden="true" />
        </div>
        <button
          onClick={() => doLogout()}
          className="btn-ghost btn-icon text-secondary-500 hover:text-red-600"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
