import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types';

interface Props {
  pagination: PaginationMeta;
  onChange: (page: number) => void;
}

export default function Pagination({ pagination, onChange }: Props) {
  const { page, pages, total } = pagination;
  if (pages <= 1) return null;

  const getPages = () => {
    const items: (number | '...')[] = [];
    const delta = 2;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        items.push(i);
      } else if (items[items.length - 1] !== '...') {
        items.push('...');
      }
    }
    return items;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between py-4">
      <p className="text-sm text-secondary-500">
        Page <span className="font-medium text-secondary-900">{page}</span> of{' '}
        <span className="font-medium text-secondary-900">{pages}</span>
        {' '}({total} total)
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="btn-ghost btn-icon disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-secondary-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-700 hover:bg-secondary-100'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="btn-ghost btn-icon disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
