import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, User, Briefcase, GraduationCap, BookOpen, FlaskConical,
  DollarSign, BookMarked, Users, Shield, Trophy, Image, Link2, Mail,
  UserCheck, Settings, FileText, BookmarkCheck, X,
} from 'lucide-react';

const nav = [
  { label: 'Dashboard',         href: '/admin',                icon: LayoutDashboard },
  { label: 'Profile',           href: '/admin/profile',        icon: User },
  { label: 'Appointments',      href: '/admin/appointments',   icon: Briefcase },
  { label: 'Education',         href: '/admin/education',      icon: GraduationCap },
  { label: 'Research Areas',    href: '/admin/research-areas', icon: FlaskConical },
  { label: 'Publications',      href: '/admin/publications',   icon: BookOpen },
  { label: 'Funded Research',   href: '/admin/funded-research',icon: DollarSign },
  { label: 'Teaching',          href: '/admin/teaching',       icon: BookMarked },
  { label: 'Supervision',       href: '/admin/supervision',    icon: GraduationCap },
  { label: 'Service',           href: '/admin/service',        icon: Shield },
  { label: 'Awards',            href: '/admin/awards',         icon: Trophy },
  { label: 'Media',             href: '/admin/media',          icon: Image },
  { label: 'Memberships',       href: '/admin/memberships',    icon: BookmarkCheck },
  { label: 'External Profiles', href: '/admin/external-profiles', icon: Link2 },
  { label: 'Contact',           href: '/admin/contact',        icon: Mail },
  { label: 'Users',             href: '/admin/users',          icon: Users },
  { label: 'Settings',          href: '/admin/settings',       icon: Settings },
  { label: 'Audit Logs',        href: '/admin/audit-logs',     icon: FileText },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-secondary-900 text-white flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        aria-label="Admin sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary-800">
          <div>
            <p className="font-bold text-sm text-white">Academic Profile</p>
            <p className="text-xs text-secondary-400">Content Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden btn-ghost btn-icon text-secondary-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Admin navigation">
          <ul className="space-y-0.5">
            {nav.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <NavLink
                  to={href}
                  end={href === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-700 text-white'
                        : 'text-secondary-400 hover:bg-secondary-800 hover:text-white'
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-secondary-800">
          <NavLink to="/" target="_blank" className="text-xs text-secondary-500 hover:text-white transition-colors">
            ← View Public Site
          </NavLink>
        </div>
      </aside>
    </>
  );
}
