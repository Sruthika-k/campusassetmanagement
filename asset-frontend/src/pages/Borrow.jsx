import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { borrowAPI } from '../api/api';
import './Borrow.css';

function StatusBadge({ status }) {
  const map = {
    PENDING:  { label: 'Pending',  color: '#b7791f', bg: '#fffaf0' },
    APPROVED: { label: 'Approved', color: '#276749', bg: '#f0fff4' },
    RETURNED: { label: 'Returned', color: '#2b6cb0', bg: '#ebf8ff' },
    REJECTED: { label: 'Rejected', color: '#c53030', bg: '#fff5f5' },
  };
  const s = map[status] || { label: status, color: '#666', bg: '#f7fafc' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      color: s.color, backgroundColor: s.bg,
    }}>
      {s.label}
    </span>
  );
}

const TABS = ['ALL', 'PENDING', 'APPROVED', 'RETURNED', 'REJECTED'];

const Borrow = () => {
  const { user } = useAuth();
  const role = user?.role;
  const canApprove = role === 'ADMIN' || role === 'LAB_INCHARGE';
  const isAdmin    = role === 'ADMIN';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('ALL');
  const [myOnly, setMyOnly]     = useState(false);
  const [toast, setToast]       = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await borrowAPI.getAll();
      setRequests(res.data || []);
    } catch (err) {
      showToast('Failed to load borrow requests', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Borrow Requests — AssetFlow';
    fetchData();
  }, [fetchData]);

  const doAction = async (fn, successMsg, confirm_msg) => {
    if (confirm_msg && !window.confirm(confirm_msg)) return;
    try {
      await fn();
      showToast(successMsg);
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Action failed', 'error');
    }
  };

  const filtered = requests
    .filter(r => myOnly ? r.requestedById === user?.id : true)
    .filter(r => tab === 'ALL' || r.status === tab);

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const colSpan = isAdmin ? 5 : 4;

  return (
    <div className="page-container">
      {toast.msg && (
        <div className={`sys-toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Borrow Requests</h1>
          {pendingCount > 0 && (
            <span className="badge-count">{pendingCount} pending</span>
          )}
        </div>
        {canApprove && (
          <button
            className={`btn ${myOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMyOnly(v => !v)}
          >
            {myOnly ? 'Showing Mine' : 'Show Mine Only'}
          </button>
        )}
      </div>

      <div className="pill-tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`pill-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              {isAdmin && <th>Requested By</th>}
              <th>Requested Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={colSpan}><div className="shimmer-row"></div></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" className="empty-state-svg" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    <h3>No {tab === 'ALL' ? '' : tab.toLowerCase() + ' '}requests</h3>
                    <p>There are no borrow requests matching this filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(req => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.assetName || 'Unknown Asset'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                      {req.assetId?.substring(0, 8)}…
                    </div>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ fontWeight: 500 }}>{req.requestedByName || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{req.requestedByEmail || ''}</div>
                    </td>
                  )}
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    }) : '—'}
                  </td>
                  <td><StatusBadge status={req.status} /></td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {canApprove && req.status === 'PENDING' && (
                        <>
                          <button
                            className="btn btn-ghost"
                            style={{ color: '#276749', borderColor: '#9ae6b4' }}
                            onClick={() => doAction(
                              () => borrowAPI.approve(req.id),
                              'Borrow request approved.',
                            )}
                          >Approve</button>
                          <button
                            className="btn btn-ghost destructive"
                            onClick={() => doAction(
                              () => borrowAPI.reject(req.id),
                              'Request rejected.',
                              'Reject this borrow request?',
                            )}
                          >Reject</button>
                        </>
                      )}
                      {canApprove && req.status === 'APPROVED' && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => doAction(
                            () => borrowAPI.return(req.id),
                            'Asset marked as returned.',
                            'Confirm return of this asset?',
                          )}
                        >Mark Returned</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Borrow;
