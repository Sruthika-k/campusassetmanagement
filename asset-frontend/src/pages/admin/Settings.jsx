import React, { useState, useEffect, useCallback } from 'react';
import { assetAPI, departmentAPI, roomAPI, userAPI, historyAPI } from '../../api/api';
import '../Assets.css';

const Settings = () => {
  const [stats, setStats] = useState({ departments: 0, rooms: 0, users: 0, assets: 0 });
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [clearingRetired, setClearingRetired] = useState(false);
  const [toast, setToast] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const [depts, rooms, users, assets] = await Promise.all([
        departmentAPI.getAll(),
        roomAPI.getAll(),
        userAPI.getAll(),
        assetAPI.getAll()
      ]);
      setStats({
        departments: depts.data.length,
        rooms: rooms.data.length,
        users: users.data.length,
        assets: assets.data.length
      });
    } catch (err) {
      console.error('Failed to load system stats');
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleExportCSV = async () => {
    try {
      const res = await assetAPI.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assets-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToastMsg('CSV export started');
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const handleViewLogs = async () => {
    setShowLogsModal(true);
    setLoadingLogs(true);
    try {
      const res = await historyAPI.getAllEvents();
      setLogs(res.data.slice(0, 50));
    } catch (err) {
      console.error('Failed to load system logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleClearRetired = async () => {
    const confirmation = prompt('These actions are irreversible. Type "DELETE" to confirm clearing retired assets:');
    if (confirmation === 'DELETE') {
      setClearingRetired(true);
      try {
        const res = await assetAPI.clearRetired();
        showToastMsg(`Permanently deleted ${res.data} retired assets.`);
        fetchStats();
      } catch (err) {
        alert('Failed to clear retired assets');
      } finally {
        setClearingRetired(false);
      }
    }
  };

  const getEventColor = (type) => {
    if (type.includes('CREATED')) return '#4CAF50';
    if (type.includes('DELETED')) return '#F44336';
    if (type.includes('UPDATED')) return '#2196F3';
    return '#9E9E9E';
  };

  return (
    <div className="page-container">
      {toast && <div className="sys-toast">✅ {toast}</div>}

      <div className="page-header">
        <h1 className="page-title">Admin Settings</h1>
      </div>

      <div className="settings-section">
        <h2 className="section-title">System Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div className="stat-card">
            <span className="stat-label">Total Departments</span>
            <span className="stat-value">{stats.departments}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Rooms</span>
            <span className="stat-value">{stats.rooms}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.users}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Assets</span>
            <span className="stat-value">{stats.assets}</span>
          </div>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: 40 }}>
        <h2 className="section-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, marginRight: 8 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Assets CSV
          </button>
          <button className="btn btn-secondary" onClick={handleViewLogs}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, marginRight: 8 }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            View System Logs
          </button>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: 40 }}>
        <h2 className="section-title">Danger Zone</h2>
        <div className="danger-zone-card">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>These actions are irreversible. Proceed with caution.</p>
          <button className="btn btn-danger" onClick={handleClearRetired} disabled={clearingRetired}>
            {clearingRetired ? 'Clearing...' : 'Clear Retired Assets'}
          </button>
        </div>
      </div>

      {showLogsModal && (
        <div className="modal-backdrop" onClick={() => setShowLogsModal(false)}>
          <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">System Logs (Last 50 Events)</h2>
              <button className="modal-close" onClick={() => setShowLogsModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 500, overflowY: 'auto', padding: 0 }}>
              {loadingLogs ? (
                <div style={{ padding: 20 }}>Loading system events...</div>
              ) : logs.length === 0 ? (
                <div style={{ padding: 20 }}>No logs found.</div>
              ) : (
                <div className="log-list">
                  {logs.map(log => (
                    <div key={log.id} className="log-item">
                      <div className="log-indicator" style={{ backgroundColor: getEventColor(log.type) }}></div>
                      <div className="log-content">
                        <div className="log-description">{log.description}</div>
                        <div className="log-meta">
                          <span className="log-actor">{log.actorEmail || 'System'}</span>
                          <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .settings-section { margin-bottom: 32px; }
        .section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .stat-label { font-size: 12px; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; }
        .stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary); }
        .danger-zone-card { border: 1px solid #ff4d4f; background: #fff1f0; padding: 20px; borderRadius: 12px; }
        .log-item { display: flex; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
        .log-indicator { width: 8px; height: 8px; borderRadius: 50%; marginTop: 6px; flex-shrink: 0; }
        .log-description { font-size: 14px; color: var(--text-primary); font-weight: 500; margin-bottom: 4px; }
        .log-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-tertiary); }
        .btn-danger { background: #ff4d4f; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-danger:hover { background: #ff7875; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
      `}} />
    </div>
  );
};

export default Settings;
