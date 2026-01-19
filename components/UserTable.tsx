import React, { useState, useEffect } from 'react';
import { ADUserProcessed } from '../types';
import { ArrowUpDown, AlertTriangle, Shield, CheckCircle, User, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

interface Props {
  users: ADUserProcessed[];
  initialRiskFilter?: string;
  initialSearch?: string;
  onUserClick: (user: ADUserProcessed) => void;
}

export const UserTable: React.FC<Props> = ({ users, initialRiskFilter = 'All', initialSearch = '', onUserClick }) => {
  const [filter, setFilter] = useState(initialSearch);
  const [riskFilter, setRiskFilter] = useState(initialRiskFilter);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ADUserProcessed | 'totalRiskScore'; direction: 'asc' | 'desc' } | null>({ key: 'totalRiskScore', direction: 'desc' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Update internal state if props change (drill-down behavior)
  useEffect(() => {
    setRiskFilter(initialRiskFilter);
    setFilter(initialSearch);
    setCurrentPage(1); // Reset to page 1 on external filter change
  }, [initialRiskFilter, initialSearch]);

  // Reset to page 1 when internal filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, riskFilter]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.UserName.toLowerCase().includes(filter.toLowerCase()) || 
                          user.SamAccountName.toLowerCase().includes(filter.toLowerCase()) ||
                          user.Department?.toLowerCase().includes(filter.toLowerCase());
    const matchesRisk = riskFilter === 'All' || user.risk.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aVal: any = a[sortConfig.key as keyof ADUserProcessed];
    let bVal: any = b[sortConfig.key as keyof ADUserProcessed];

    if (sortConfig.key === 'totalRiskScore') {
        aVal = a.risk.totalRiskScore;
        bVal = b.risk.totalRiskScore;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination Logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRiskBadge = (level: string) => {
    const styles = {
      Critical: 'bg-red-950/40 text-red-400 border-red-900',
      High: 'bg-orange-950/40 text-orange-400 border-orange-900',
      Medium: 'bg-yellow-950/40 text-yellow-400 border-yellow-900',
      Low: 'bg-green-950/40 text-green-400 border-green-900',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[level as keyof typeof styles] || styles.Low}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-64">
             <input
                type="text"
                placeholder="Search users, email, dept..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-200 placeholder-slate-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
        </div>
       
        <div className="flex gap-2 flex-wrap">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(lvl => (
                <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-3 py-1 text-sm rounded-full transition-all border ${riskFilter === lvl ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'}`}
                >
                    {lvl}
                </button>
            ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800 custom-scrollbar shadow-lg">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900 text-xs uppercase text-slate-500 font-semibold border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleSort('UserName')}>
                <div className="flex items-center gap-1">Identity <ArrowUpDown size={14} /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleSort('Department')}>
                <div className="flex items-center gap-1">Dept <ArrowUpDown size={14} /></div>
              </th>
               <th className="px-6 py-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => handleSort('totalRiskScore')}>
                <div className="flex items-center gap-1">
                    Risk Score <ArrowUpDown size={14} />
                    <Tooltip text="Combined score of Privilege Risk (60%) and Password Hygiene (40%)" />
                </div>
              </th>
              <th className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    Breakdown
                    <Tooltip text="Individual scores for Group Privileges and Password settings (0-100)" />
                  </div>
              </th>
              <th className="px-6 py-4">Issues</th>
              <th className="px-6 py-4">Recommended Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                          <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{user.UserName}</div>
                        <div className="text-xs text-slate-500">{user.SamAccountName}</div>
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4">{user.Department || 'N/A'}</td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${user.risk.totalRiskScore > 70 ? 'text-red-500' : user.risk.totalRiskScore > 40 ? 'text-orange-400' : 'text-slate-200'}`}>
                            {user.risk.totalRiskScore}
                        </span>
                        {getRiskBadge(user.risk.riskLevel)}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-slate-400">
                        <span className="flex justify-between w-28 p-1 rounded hover:bg-slate-800">Privilege: <b className="text-slate-200">{user.risk.privilegeScore}</b></span>
                        <span className="flex justify-between w-28 p-1 rounded hover:bg-slate-800">Hygiene: <b className="text-slate-200">{user.risk.passwordHygieneScore}</b></span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    {user.risk.issues.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {user.risk.issues.slice(0, 2).map((issue, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-950/40 text-red-400 border border-red-900/50">
                                    <AlertTriangle size={10} /> {issue}
                                </span>
                            ))}
                            {user.risk.issues.length > 2 && (
                                <div className="relative group/more inline-flex">
                                    <span className="cursor-pointer text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-700">
                                        +{user.risk.issues.length - 2} more
                                    </span>
                                    {/* Issues Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-slate-800 text-slate-200 text-xs rounded shadow-xl border border-slate-700 opacity-0 group-hover/more:opacity-100 pointer-events-none z-50">
                                        <ul className="list-disc pl-3 space-y-1">
                                            {user.risk.issues.slice(2).map((issue, k) => (
                                                <li key={k}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-green-500 flex items-center gap-1 text-xs font-medium"><CheckCircle size={12}/> Clean</span>
                    )}
                </td>
                <td className="px-6 py-4">
                   {user.risk.recommendations.length > 0 ? (
                       <button 
                            onClick={() => onUserClick(user)}
                            className="px-3 py-1.5 rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 text-xs font-medium border border-indigo-500/20 transition-all flex items-center gap-1"
                       >
                           {user.risk.recommendations[0]}
                       </button>
                   ) : <span className="text-slate-600 text-xs">-</span>}
                </td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                            <Shield size={32} className="text-slate-700 mb-2"/>
                            <p>No users found matching filters.</p>
                            <button onClick={() => {setFilter(''); setRiskFilter('All')}} className="mt-2 text-indigo-400 text-xs hover:underline">Clear Filters</button>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-2">
         <div className="text-xs text-slate-500">
             Showing {Math.min(startIndex + 1, sortedUsers.length)} to {Math.min(startIndex + itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
         </div>
         
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Rows per page:</span>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer hover:border-slate-600 transition-colors"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
             </div>

             <div className="flex items-center gap-1">
                 <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 transition-colors"
                    aria-label="Previous Page"
                 >
                     <ChevronLeft size={16} />
                 </button>
                 <span className="text-xs text-slate-400 px-2 min-w-[80px] text-center">
                    Page {currentPage} of {Math.max(1, totalPages)}
                 </span>
                 <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 rounded-md hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 transition-colors"
                    aria-label="Next Page"
                 >
                     <ChevronRight size={16} />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};