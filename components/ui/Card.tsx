import React from 'react';
import { Tooltip } from './Tooltip';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', action }) => {
  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          {title && <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6 text-slate-300">
        {children}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  tooltipText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, color = "text-white", icon, onClick, tooltipText }) => (
  <div 
    onClick={onClick}
    className={`bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg flex items-start justify-between transition-all hover:bg-slate-800/80 ${onClick ? 'cursor-pointer hover:border-indigo-500/50' : ''}`}
  >
    <div>
      <div className="flex items-center gap-1 mb-1">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        {tooltipText && <Tooltip text={tooltipText} />}
      </div>
      <h4 className={`text-2xl font-bold ${color}`}>{value}</h4>
      {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
    </div>
    {icon && <div className="p-3 bg-slate-800 rounded-lg text-slate-400 border border-slate-700">{icon}</div>}
  </div>
);