import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, FolderOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'Try exploring other categories or clearing your search filters.',
  actionText = 'Explore Destinations',
  actionLink = '/destinations',
  onAction,
}) {
  return (
    <div className="py-16 px-4 text-center max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-extrabold text-lg text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {(actionText && (actionLink || onAction)) && (
        <div className="pt-2">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-sm transition-all hover:scale-105"
            >
              <Compass className="w-4 h-4" /> {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
