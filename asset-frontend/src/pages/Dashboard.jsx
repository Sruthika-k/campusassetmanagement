import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetAPI, borrowAPI, issueAPI, historyAPI } from '../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    pendingRequests: 0,
    openIssues: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [assetBreakdown, setAssetBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Dashboard - AssetFlow';
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Only load what everyone has access to (Admin has all events)
        const [assetsRes, borrowRes, issuesRes, eventsRes] = await Promise.allSettled([
          assetAPI.getAll(),
          borrowAPI.getAll(),
          issueAPI.getAll(),
          user?.role === 'ADMIN' ? historyAPI.getAllEvents() : Promise.resolve({ data: [] })
        ]);

        const assets = assetsRes.status === 'fulfilled' ? assetsRes.value.data || [] : [];
        const borrowReq = borrowRes.status === 'fulfilled' ? borrowRes.value.data || [] : [];
        const issues = issuesRes.status === 'fulfilled' ? issuesRes.value.data || [] : [];
        const events = eventsRes.status === 'fulfilled' ? eventsRes.value.data || [] : [];

        setStats({
          totalAssets: assets.length,
          availableAssets: assets.filter(a => a.status === 'AVAILABLE').length,
          pendingRequests: borrowReq.filter(req => req.status === 'PENDING').length,
          openIssues: issues.filter(issue => issue.status === 'OPEN').length,
        });

        // Event formatting (Top 5)
        setRecentEvents(events.slice(0, 5));

        // Breakdown stats
        const breakdown = {};
        assets.forEach(a => {
          breakdown[a.status] = (breakdown[a.status] || 0) + 1;
        });
        setAssetBreakdown(breakdown);

      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const getEventIcon = (type) => {
    if (type.includes('CREATED')) return { fill: 'var(--green)', path: "M12 4v16m8-8H4" }; // Plus
    if (type.includes('DELETED')) return { fill: 'var(--red)', path: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }; // Trash
    if (type.includes('ISSUE')) return { fill: 'var(--amber)', path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }; // Warning
    if (type.includes('BORROW') || type.includes('RESERVATION')) return { fill: 'var(--accent)', path: "M8 7v8a2 2 0 002 2h6M8 7l4-4m-4 4l-4-4" }; // Assign/Return
    return { fill: 'var(--text-secondary)', path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }; // Info
  };

  const fmtRelative = (dtStr) => {
    const minDiff = Math.round((new Date() - new Date(dtStr)) / 60000);
    if (minDiff < 60) return `${minDiff} min ago`;
    const hrDiff = Math.floor(minDiff/60);
    if (hrDiff < 24) return `${hrDiff} hr ago`;
    return `${Math.floor(hrDiff/24)} days ago`;
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>Dashboard Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
        </div>
        <div className="dash-date">{todayStr}</div>
      </div>

      <div className="dash-stat-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Assets</span>
            <svg viewBox="0 0 24 24" className="stat-icon svg-accent"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div className="stat-value">{stats.totalAssets}</div>
          <div className="stat-footer">Tracked inventory network</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Available</span>
            <svg viewBox="0 0 24 24" className="stat-icon svg-green"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="stat-value">{stats.availableAssets}</div>
          <div className="stat-footer">Ready for deployment</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pending Borrows</span>
            <svg viewBox="0 0 24 24" className="stat-icon svg-amber"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
          <div className="stat-value">{stats.pendingRequests}</div>
          <div className="stat-footer">Awaiting authorization</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Open Issues</span>
            <svg viewBox="0 0 24 24" className="stat-icon svg-red"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <div className="stat-value">{stats.openIssues}</div>
          <div className="stat-footer">Active maintenance queues</div>
        </div>
      </div>

      <div className="dash-btm-grid">
        <div className="dash-panel panel-lg">
          <div className="panel-header">
            <span className="section-header">Recent Activity</span>
          </div>
          <div className="panel-body">
            {recentEvents.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <p>No recent activity detected.</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentEvents.map(ev => {
                  const evFormat = getEventIcon(ev.eventType);
                  return (
                    <div className="activity-row" key={ev.id}>
                      <div className="activity-icon-wrap" style={{ color: evFormat.fill }}>
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={evFormat.path}/></svg>
                      </div>
                      <div className="activity-content">
                        <div className="act-desc">{ev.description}</div>
                        <div className="act-meta">{ev.eventType} • {ev.actorId || 'System'}</div>
                      </div>
                      <div className="activity-time">{fmtRelative(ev.timestamp)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="dash-panel panel-sm">
          <div className="panel-header">
            <span className="section-header">Status Breakdown</span>
          </div>
          <div className="panel-body">
            {stats.totalAssets === 0 ? (
               <div className="empty-state" style={{ padding: '32px 0' }}>
               <p>No asset data available.</p>
             </div>
            ) : (
              <div className="breakdown-list">
                {Object.entries(assetBreakdown).sort((a,b)=>b[1]-a[1]).map(([status, count]) => {
                  const pct = Math.round((count / stats.totalAssets) * 100);
                  return (
                    <div className="bd-row" key={status}>
                      <div className="bd-labels">
                        <span className="bd-name">{status.replace(/_/g,' ')}</span>
                        <span className="bd-count">{count}</span>
                      </div>
                      <div className="bd-track">
                        <div className={`bd-fill bar-${status}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
