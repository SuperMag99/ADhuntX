import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ADUserProcessed } from '../types';

interface ChartsProps {
  users: ADUserProcessed[];
}

const COLORS = {
  Critical: '#ef4444', // red-500
  High: '#f97316',     // orange-500
  Medium: '#eab308',   // yellow-500
  Low: '#22c55e',      // green-500
  Slate: '#64748b'
};

const AXIS_STYLE = { fontSize: 12, fill: '#94a3b8' }; // slate-400
const TOOLTIP_STYLE = { backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }; // slate-800 bg

export const RiskDistributionChart: React.FC<ChartsProps> = ({ users }) => {
  const data = [
    { name: 'Critical', value: users.filter(u => u.risk.riskLevel === 'Critical').length, color: COLORS.Critical },
    { name: 'High', value: users.filter(u => u.risk.riskLevel === 'High').length, color: COLORS.High },
    { name: 'Medium', value: users.filter(u => u.risk.riskLevel === 'Medium').length, color: COLORS.Medium },
    { name: 'Low', value: users.filter(u => u.risk.riskLevel === 'Low').length, color: COLORS.Low },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#f8fafc' }} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }}/>
      </PieChart>
    </ResponsiveContainer>
  );
};

export const IssuesBarChart: React.FC<ChartsProps> = ({ users }) => {
  const dormantCount = users.filter(u => u.isDormant).length;
  const noMfaCount = users.filter(u => !u.hasMFA).length;
  const passwordNeverExpiresCount = users.filter(u => u.passwordNeverExpires).length;
  const highPrivCount = users.filter(u => u.risk.privilegeScore > 50).length;

  const data = [
    { name: 'No MFA', count: noMfaCount },
    { name: 'Dormant', count: dormantCount },
    { name: 'Pwd Never Exp', count: passwordNeverExpiresCount },
    { name: 'High Priv', count: highPrivCount },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" width={100} tick={AXIS_STYLE} />
        <Tooltip cursor={{fill: 'transparent'}} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RiskMatrix: React.FC<ChartsProps> = ({ users }) => {
    // Simplification for Matrix: Bucket users by Priv Score vs Pwd Score
    const matrix = [
        { x: 'Low Priv', y: 'Low Hyg', count: 0, r: 0 },
        { x: 'Low Priv', y: 'High Hyg', count: 0, r: 0 },
        { x: 'High Priv', y: 'Low Hyg', count: 0, r: 0 },
        { x: 'High Priv', y: 'High Hyg', count: 0, r: 0 },
    ];

    users.forEach(u => {
        const isHighPriv = u.risk.privilegeScore > 50;
        const isBadHyg = u.risk.passwordHygieneScore > 50; // "High Risk" in hygiene means BAD hygiene

        if (!isHighPriv && !isBadHyg) matrix[0].count++;
        if (!isHighPriv && isBadHyg) matrix[1].count++;
        if (isHighPriv && !isBadHyg) matrix[2].count++;
        if (isHighPriv && isBadHyg) matrix[3].count++;
    });

    return (
        <div className="grid grid-cols-2 gap-4 h-[300px] p-4 relative bg-slate-900 rounded border border-slate-800">
             {/* Labels */}
             <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-slate-500 uppercase tracking-widest origin-center">Password Risk</div>
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 uppercase tracking-widest">Privilege Risk</div>

            {/* Q2: High Priv / Low Pass Risk */}
            <div className={`flex flex-col items-center justify-center border-b border-r border-slate-800 p-2 ${matrix[2].count > 0 ? 'bg-orange-950/30' : ''}`}>
                <span className="text-3xl font-bold text-orange-500">{matrix[2].count}</span>
                <span className="text-xs text-center text-slate-400 mt-1">High Priv<br/>Good Hygiene</span>
            </div>

            {/* Q4: High Priv / High Pass Risk (CRITICAL) */}
            <div className={`flex flex-col items-center justify-center border-b border-slate-800 p-2 ${matrix[3].count > 0 ? 'bg-red-950/30' : ''}`}>
                 <span className="text-3xl font-bold text-red-500">{matrix[3].count}</span>
                 <span className="text-xs text-center text-slate-400 mt-1">High Priv<br/>Poor Hygiene</span>
            </div>

            {/* Q1: Low Priv / Low Pass Risk */}
            <div className={`flex flex-col items-center justify-center border-r border-slate-800 p-2 ${matrix[0].count > 0 ? 'bg-green-950/30' : ''}`}>
                <span className="text-3xl font-bold text-green-500">{matrix[0].count}</span>
                <span className="text-xs text-center text-slate-400 mt-1">Low Priv<br/>Good Hygiene</span>
            </div>

             {/* Q3: Low Priv / High Pass Risk */}
             <div className={`flex flex-col items-center justify-center p-2 ${matrix[1].count > 0 ? 'bg-yellow-950/30' : ''}`}>
                <span className="text-3xl font-bold text-yellow-500">{matrix[1].count}</span>
                <span className="text-xs text-center text-slate-400 mt-1">Low Priv<br/>Poor Hygiene</span>
            </div>
        </div>
    )
}