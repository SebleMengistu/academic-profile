import { LucideIcon } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-secondary-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-secondary-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-secondary-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
