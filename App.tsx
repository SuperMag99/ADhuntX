import React, { useState, useEffect } from 'react';
import { Upload, Shield, Users, Lock, AlertOctagon, FileText, Download, Activity, RefreshCw, ChevronRight, BarChart3, LayoutDashboard, X, User, BookOpen, Linkedin, Github, Radar } from 'lucide-react';
import { parseCSV, processUserData, generateSampleCSV, exportToCSV, downloadCSVTemplate } from './utils';
import { ADUserProcessed } from './types';
import { Card, StatCard } from './components/ui/Card';
import { RiskDistributionChart, IssuesBarChart, RiskMatrix } from './components/Charts';
import { UserTable } from './components/UserTable';
import { Tooltip } from './components/ui/Tooltip';

type Tab = 'dashboard' | 'users' | 'reports' | 'documentation';

const Footer = () => (
  <footer className="mt-12 py-6 text-center text-slate-500 text-sm border-t border-slate-800/50">
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <p>&copy; {new Date().getFullYear()} ADhuntX. MIT License.</p>
      <div className="flex items-center gap-4">
        <a href="https://www.linkedin.com/in/mag99/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
          <Linkedin size={14} /> LinkedIn
        </a>
        <a href="https://github.com/SuperMag99" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
          <Github size={14} /> GitHub
        </a>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [data, setData] = useState<ADUserProcessed[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  
  // Drill-down filter state
  const [userTableFilters, setUserTableFilters] = useState({ riskLevel: 'All', search: '' });

  // Modal State
  const [selectedUser, setSelectedUser] = useState<ADUserProcessed | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rawUsers = parseCSV(text);
        if (rawUsers.length === 0) throw new Error("No valid users found in CSV.");
        const processed = processUserData(rawUsers);
        setData(processed);
        localStorage.setItem('adSentinelLastImport', JSON.stringify(processed.slice(0, 100))); // Persist sample
      } catch (err) {
        setError("Failed to parse CSV. Ensure format is correct.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
      const text = generateSampleCSV();
      const raw = parseCSV(text);
      setData(processUserData(raw));
  };

  const handleExport = () => {
      if (data) {
          exportToCSV(data);
      }
  };

  const navigateToUsers = (filters: { riskLevel?: string, search?: string }) => {
      setUserTableFilters({
          riskLevel: filters.riskLevel || 'All',
          search: filters.search || ''
      });
      setCurrentTab('users');
  };

  // KPI Calculations
  const metrics = data ? {
      total: data.length,
      critical: data.filter(u => u.risk.riskLevel === 'Critical').length,
      high: data.filter(u => u.risk.riskLevel === 'High').length,
      avgScore: Math.round(data.reduce((acc, curr) => acc + curr.risk.totalRiskScore, 0) / data.length),
      mfaRate: Math.round((data.filter(u => u.hasMFA).length / data.length) * 100)
  } : null;

  // --- Modal Component (Inline) ---
  const UserDetailModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400">
                    <User size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.UserName}</h2>
                    <p className="text-slate-400 text-sm">{selectedUser.SamAccountName} • {selectedUser.Department || 'No Dept'}</p>
                </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Risk Score Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${selectedUser.risk.totalRiskScore > 70 ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-800 border-slate-700'}`}>
                    <p className="text-sm text-slate-400 mb-1">Total Risk Score</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${selectedUser.risk.totalRiskScore > 70 ? 'text-red-500' : 'text-white'}`}>{selectedUser.risk.totalRiskScore}</span>
                        <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">Enabled</span>
                            <span className={selectedUser.isEnabled ? "text-green-400" : "text-slate-500"}>{selectedUser.isEnabled ? 'Yes' : 'No'}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-300">MFA Active</span>
                            <span className={selectedUser.hasMFA ? "text-green-400" : "text-red-400"}>{selectedUser.hasMFA ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Group Memberships */}
            <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Users size={16}/> Group Memberships ({selectedUser.groups.length})
                </h3>
                <div className="bg-slate-950 rounded-lg border border-slate-800 p-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {selectedUser.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {selectedUser.groups.map((group, idx) => {
                                // Highlight sensitive groups
                                const isHighPriv = ['admin', 'operator', 'backup'].some(k => group.toLowerCase().includes(k));
                                return (
                                    <span 
                                        key={idx} 
                                        className={`px-3 py-1 text-xs rounded-full border ${isHighPriv ? 'bg-orange-950/40 text-orange-400 border-orange-900/60' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                                    >
                                        {group}
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm p-2">No group memberships found.</p>
                    )}
                </div>
            </div>

            {/* Specific Issues */}
            <div>
                 <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <AlertOctagon size={16}/> Identified Risks
                </h3>
                <ul className="space-y-2">
                    {selectedUser.risk.issues.length > 0 ? selectedUser.risk.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-red-950/10 border border-red-900/30 rounded-lg text-red-300 text-sm">
                            <AlertOctagon size={16} className="mt-0.5 shrink-0" />
                            {issue}
                        </li>
                    )) : (
                        <li className="p-3 bg-green-950/10 border border-green-900/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                            <Shield size={16}/> No critical risks identified.
                        </li>
                    )}
                </ul>
            </div>

             {/* Remediation */}
             <div>
                 <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Shield size={16}/> Recommended Actions
                </h3>
                <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-4">
                     <ul className="list-disc pl-5 space-y-1 text-indigo-200 text-sm">
                        {selectedUser.risk.recommendations.length > 0 ? selectedUser.risk.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        )) : <li>No actions required.</li>}
                     </ul>
                </div>
            </div>

          </div>
        </div>
      </div>
    );
  };


  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full animate-in fade-in duration-700 flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl shadow-lg mb-4 shadow-indigo-900/20">
                    <Radar size={48} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">ADhuntX</h1>
                <p className="text-lg text-slate-400">Offline Active Directory Risk & Hygiene Dashboard</p>
            </div>

            <Card className="border-t-4 border-t-indigo-500">
                <div className="text-center py-10">
                    <Upload className="mx-auto h-16 w-16 text-slate-600 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Import AD Export CSV</h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Upload your CSV containing UserName, MemberOf, LastLogon, and Password details. Data is processed locally.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <label className="relative cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-6 rounded-lg shadow-lg shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                            <span>Select CSV File</span>
                            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                        <button onClick={loadSample} className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline">
                            Load Sample Data
                        </button>
                    </div>
                    {error && <p className="mt-4 text-red-400 text-sm font-medium bg-red-950/50 border border-red-900 py-2 rounded">{error}</p>}
                </div>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-slate-500">
                <div className="flex flex-col items-center group">
                    <div className="p-3 bg-slate-900 rounded-full shadow-md mb-2 group-hover:scale-110 transition-transform border border-slate-800">
                        <Lock className="text-indigo-500" size={20}/>
                    </div>
                    <span>Analyzes Group Privileges</span>
                </div>
                <div className="flex flex-col items-center group">
                     <div className="p-3 bg-slate-900 rounded-full shadow-md mb-2 group-hover:scale-110 transition-transform border border-slate-800">
                        <Activity className="text-indigo-500" size={20}/>
                    </div>
                    <span>Tracks Password Hygiene</span>
                </div>
                <div className="flex flex-col items-center group">
                     <div className="p-3 bg-slate-900 rounded-full shadow-md mb-2 group-hover:scale-110 transition-transform border border-slate-800">
                        <AlertOctagon className="text-indigo-500" size={20}/>
                    </div>
                    <span>Highlights Dormant Accounts</span>
                </div>
            </div>
        </div>
        <div className="w-full max-w-2xl">
            <Footer />
        </div>
      </div>
    );
  }

  const NavButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
    <button 
        onClick={() => setCurrentTab(id)}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${currentTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
        <Icon size={20} />
        <span className="hidden lg:block font-medium">{label}</span>
        {currentTab === id && <ChevronRight size={16} className="ml-auto opacity-50 hidden lg:block"/>}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
        <UserDetailModal />
        
        {/* Sidebar */}
        <div className="w-20 lg:w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20 shadow-2xl border-r border-slate-800">
            <div className="p-6 flex items-center gap-3 font-bold text-white text-xl border-b border-slate-800">
                <div className="p-2 bg-indigo-600 rounded-lg">
                     <Radar className="text-white" size={20} />
                </div>
                <span className="hidden lg:block tracking-tight text-lg">ADhuntX</span>
            </div>
            
            <nav className="flex-1 mt-6 px-3 space-y-2">
                <NavButton id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                <NavButton id="users" label="User Analysis" icon={Users} />
                <NavButton id="reports" label="Reports" icon={FileText} />
                <NavButton id="documentation" label="Documentation" icon={BookOpen} />
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <button onClick={() => setData(null)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-950/30 hover:text-red-400 rounded-lg transition-colors text-slate-400">
                    <RefreshCw size={20} />
                    <span className="hidden lg:block font-medium">Reset Data</span>
                </button>
            </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-10 overflow-y-auto flex flex-col">
            <div className="flex-1">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {currentTab === 'dashboard' && 'Security Dashboard'}
                            {currentTab === 'users' && 'User Risk Analysis'}
                            {currentTab === 'reports' && 'Export Reports'}
                            {currentTab === 'documentation' && 'Documentation & Help'}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Active Directory analysis as of <span className="font-medium text-slate-300">{new Date().toLocaleDateString()}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-600 shadow-sm font-medium transition-all active:scale-95"
                        >
                            <Download size={18} /> 
                            <span className="hidden sm:inline">Export CSV</span>
                        </button>
                    </div>
                </header>

                {/* DASHBOARD VIEW */}
                {currentTab === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* KPI Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard 
                                label="Total Users" 
                                value={metrics?.total || 0} 
                                icon={<Users size={24}/>} 
                                onClick={() => navigateToUsers({})}
                            />
                            <StatCard 
                                label="Critical Risk" 
                                value={metrics?.critical || 0} 
                                color="text-red-500"
                                icon={<AlertOctagon size={24} className="text-red-500"/>} 
                                onClick={() => navigateToUsers({ riskLevel: 'Critical' })}
                                tooltipText="Users with a Risk Score > 70 (High Privilege + Poor Hygiene)"
                            />
                            <StatCard 
                                label="Avg Risk Score" 
                                value={metrics?.avgScore || 0} 
                                trend={metrics?.avgScore && metrics.avgScore > 50 ? "Elevated Risk" : "Acceptable"}
                                color={metrics?.avgScore && metrics.avgScore > 50 ? "text-orange-500" : "text-green-500"}
                                icon={<Activity size={24}/>} 
                                tooltipText="Average combined risk score across all users"
                            />
                            <StatCard 
                                label="MFA Adoption" 
                                value={`${metrics?.mfaRate}%`} 
                                color={metrics?.mfaRate && metrics.mfaRate < 80 ? "text-orange-500" : "text-green-500"}
                                icon={<Lock size={24}/>} 
                                tooltipText="Percentage of users with Multi-Factor Authentication enabled"
                            />
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title="Risk Distribution" className="lg:col-span-1 h-full">
                                <RiskDistributionChart users={data} />
                                <div className="text-center text-xs text-slate-500 mt-2">Distribution of users by risk severity</div>
                            </Card>
                            <Card title="Risk Matrix" className="lg:col-span-2 h-full">
                                <div className="flex items-center gap-2 mb-4 text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-800">
                                    <Activity size={14} />
                                    <span>Visualizes the correlation between <b>Privilege Level</b> (Y-Axis) and <b>Password Hygiene</b> (X-Axis).</span>
                                </div>
                                <RiskMatrix users={data} />
                            </Card>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Top Security Issues">
                                <IssuesBarChart users={data} />
                            </Card>
                            <Card title="Action Items Summary">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-red-950/20 rounded-xl border border-red-900/50 hover:bg-red-950/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-red-950/50 rounded-lg text-red-500 border border-red-900/50">
                                                <AlertOctagon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-red-400 font-bold">Dormant Privileged Accounts</p>
                                                <p className="text-red-300 text-sm">Remove {data.filter(u=>u.isDormant && u.risk.privilegeScore > 0).length} accounts</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigateToUsers({ search: 'dormant' })} 
                                            className="px-4 py-2 bg-slate-900 text-red-400 text-sm font-bold rounded-lg border border-red-900/50 hover:bg-red-950/40 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-orange-950/20 rounded-xl border border-orange-900/50 hover:bg-orange-950/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-orange-950/50 rounded-lg text-orange-500 border border-orange-900/50">
                                                <Lock size={24} />
                                            </div>
                                            <div>
                                                <p className="text-orange-400 font-bold">Missing MFA</p>
                                                <p className="text-orange-300 text-sm">Enforce for {data.filter(u=>!u.hasMFA).length} users</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigateToUsers({ search: 'MFA' })} 
                                            className="px-4 py-2 bg-slate-900 text-orange-400 text-sm font-bold rounded-lg border border-orange-900/50 hover:bg-orange-950/40 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/50 hover:bg-indigo-950/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-indigo-950/50 rounded-lg text-indigo-400 border border-indigo-900/50">
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <p className="text-indigo-400 font-bold">Password Never Expires</p>
                                                <p className="text-indigo-300 text-sm">Fix {data.filter(u=>u.passwordNeverExpires).length} accounts</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => navigateToUsers({ search: 'never expire' })}
                                            className="px-4 py-2 bg-slate-900 text-indigo-400 text-sm font-bold rounded-lg border border-indigo-900/50 hover:bg-indigo-950/40 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* USERS VIEW */}
                {currentTab === 'users' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card title="Detailed Risk Analysis" className="min-h-[600px]">
                            <UserTable 
                                users={data} 
                                initialRiskFilter={userTableFilters.riskLevel}
                                initialSearch={userTableFilters.search}
                                onUserClick={setSelectedUser}
                            />
                        </Card>
                    </div>
                )}

                {/* REPORTS VIEW */}
                {currentTab === 'reports' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card title="Generated Reports" className="min-h-[400px]">
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                                    <FileText size={32} className="text-slate-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white">Export Security Findings</h3>
                                <p className="text-slate-400 max-w-sm mx-auto mt-2 mb-8">
                                    Download a comprehensive CSV report including all user risk scores, detected issues, and remediation recommendations.
                                </p>
                                <button 
                                    onClick={handleExport}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-900/30 transition-all"
                                >
                                    <Download size={20} />
                                    Download Full CSV Report
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
                
                {/* DOCUMENTATION VIEW */}
                {currentTab === 'documentation' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <Card title="Application Overview">
                            <div className="prose prose-invert max-w-none text-slate-300">
                                <p className="text-lg">
                                    <strong>ADhuntX</strong> combines AD Privilege Risk Analysis and Password Hygiene Dashboarding into a single system.
                                </p>
                                <p>
                                    This tool is designed for internal IT/Security teams to assess and visualize user account risks based on privileges, group memberships, password hygiene, and MFA status. 
                                    It operates <strong>100% offline</strong> on your local machine—no data leaves your environment.
                                </p>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Risk Score Calculations">
                                <div className="space-y-4 text-slate-300">
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">1. Privilege Risk Score (0-100)</h4>
                                        <p className="text-sm bg-slate-950 p-3 rounded border border-slate-800 font-mono text-indigo-300">
                                            (HighPrivilegeGroupCount * 40) + (PrivilegeChains * 30) + (DormantOrphaned * 30)
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">2. Password Hygiene Risk Score (0-100)</h4>
                                        <p className="text-sm bg-slate-950 p-3 rounded border border-slate-800 font-mono text-indigo-300">
                                            (ExpiredOrWeakPassword * 40) + (DormantAccount * 30) + (MissingMFA * 30)
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-2">3. Total AD Risk Score</h4>
                                        <p className="text-sm bg-slate-950 p-3 rounded border border-slate-800 font-mono text-indigo-300">
                                            (PrivilegeRiskScore * 0.6) + (PasswordRiskScore * 0.4)
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card title="How to Get the CSV File">
                                <div className="space-y-6 text-slate-300">
                                    <p>The dashboard works entirely offline. You can obtain the required CSV using one of the following methods:</p>

                                    {/* 4.1 ADUC */}
                                    <div>
                                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded">Method 1</span>
                                        Export from Active Directory Users & Computers (ADUC)
                                    </h4>
                                    <ol className="list-decimal pl-5 space-y-1 text-sm marker:text-indigo-400">
                                        <li>Open <strong>ADUC</strong> (Active Directory Users and Computers).</li>
                                        <li>Select the target <strong>OU</strong> (Organizational Unit) or Domain root.</li>
                                        <li>Right-click the list view and select <strong>Export List...</strong></li>
                                        <li>Save as <strong>CSV</strong>.</li>
                                    </ol>
                                    </div>

                                    {/* 4.2 PowerShell */}
                                    <div>
                                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded">Method 2</span>
                                        Export using PowerShell (Recommended)
                                    </h4>
                                    <p className="text-sm mb-2">Run this script on a machine with Active Directory modules installed:</p>
                                    <div className="relative group">
                                        <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto text-xs font-mono text-green-400 custom-scrollbar">
{`Get-ADUser -Filter * -Properties MemberOf, Enabled, LastLogonDate, PasswordLastSet, PasswordNeverExpires, MFAStatus |
Select Name, SamAccountName, Enabled, LastLogonDate, MemberOf, Role, Department, PasswordLastSet, PasswordExpiryDate, MFAStatus, PasswordNeverExpires, DormantAccountFlag |
Export-Csv "ADUsers.csv" -NoTypeInformation`}
                                        </pre>
                                    </div>
                                    </div>

                                    {/* 4.3 Excel */}
                                    <div>
                                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                        <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded">Method 3</span>
                                        Create / Prepare CSV in Excel from Active Directory
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm marker:text-indigo-400">
                                        <li>Open Excel → go to <strong>Data</strong> tab → click <strong>Get Data</strong> → <strong>From Other Sources</strong> → <strong>From Active Directory</strong>.</li>
                                        <li>Connect to your Active Directory domain and select the OU or container you want to extract users from.</li>
                                        <li>Select the required fields to include in your CSV:</li>
                                    </ul>
                                    <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-indigo-300 break-all">
                                        UserName, SamAccountName, Enabled, LastLogonDate, MemberOf, Role, Department, PasswordLastSet, PasswordExpiryDate, MFAStatus, PasswordNeverExpires, DormantAccountFlag
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1 text-sm marker:text-indigo-400 mt-2">
                                        <li>Load the data into Excel → review and adjust if needed.</li>
                                        <li>Save the file as <strong>CSV (UTF-8 recommended)</strong>.</li>
                                        <li>Import this CSV into the dashboard for analysis.</li>
                                    </ul>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card title="Resources & Templates">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Download CSV Template</h3>
                                    <p className="text-slate-400 mt-1">
                                        Get a pre-formatted CSV file with all required headers. Fill this with your data if you cannot use the PowerShell script directly.
                                    </p>
                                </div>
                                <button 
                                    onClick={downloadCSVTemplate}
                                    className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-all"
                                >
                                    <FileText size={20} />
                                    Download Template
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    </div>
  );
};

export default App;