import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StatCard({
  title,
  value,
  change,
  trend = 'up', // 'up' | 'down' | 'warning'
  description = 'vs last month',
  icon: Icon,
  link,
  color = 'emerald', // 'emerald', 'sky', 'amber', 'rose', 'purple'
}) {
  const colorMap = {
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    sky: 'from-sky-500/20 to-blue-500/5 text-sky-400 border-sky-500/20',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-pink-500/5 text-rose-400 border-rose-500/20',
    purple: 'from-purple-500/20 to-indigo-500/5 text-purple-400 border-purple-500/20',
  };

  const currentTheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 shadow-lg relative overflow-hidden group">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${currentTheme}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 font-medium">
          {trend === 'up' && (
            <span className="text-emerald-400 flex items-center gap-0.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          {trend === 'down' && (
            <span className="text-rose-400 flex items-center gap-0.5 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          {trend === 'warning' && (
            <span className="text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
              {change}
            </span>
          )}
          <span className="text-slate-500">{description}</span>
        </div>

        {link && (
          <Link
            to={link}
            className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
