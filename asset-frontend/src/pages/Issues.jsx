import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI, userAPI, assetAPI } from '../api/api';
import './Borrow.css'; // pill-tabs
import './Issues.css';

function StatusBadge({ status }) {
  const map = {
    OPEN:     { label: 'Open',     color: '#c05621', bg: '#fffaf0' },
    ASSIGNED: { label: 'Assigned', color: '#2b6cb0', bg: '#ebf8ff' },
    RESOLVED: { label: 'Resolved', color: '#276749', bg: '#f0fff4' },
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

function PriorityBadge({ priority }) {
  const map = {
    HIGH:   { color: '#c53030', bg: '#fff5f5' },
    MEDIUM: { color: '#b7791f', bg: '#fffaf0' },
    LOW:    { color: '#276749', bg: '#f0fff4' },
  };
  const p = priority?.toUpperCase() || 'MEDIUM';
  const s = map[p] || { color: '#666', bg: '#f7fafc' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      color: s.color, backgroundColor: s.bg,
    }}>
      {p}
    </span>
  );
}

/* ── ASSIGN MODAL ─────────────────────────────────────────── */
function AssignModal({ issueId, onClose, onSuccess }) {
  const [techs, setTechs]         = useState([]);
  const [techId, setTechId]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    userAPI.getAll('TECHNICIAN').then(r => setTechs(r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!techId) { setError('Select a technician.'); return; }
    setSubmitting(true); setError('');
    try {
      await issueAPI.assign(issueId, techId);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to assign.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Assign Technician</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="auth-error" style={{ margin: '0 0 16px 0' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Technician</label>
              <select className="form-input" value={techId} onChange={e => setTechId(e.target.value)}>
                <option value="">-- Select --</option>
                {techs.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── RESOLVE MODAL ────────────────────────────────────────── */
function ResolveModal({ issueId, onClose, onSuccess }) {
  const [notes, setNotes]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!notes.trim()) { setError('Please enter resolution notes.'); return; }
    setSubmitting(true); setError('');
    try {
      await issueAPI.resolve(issueId, notes.trim());
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to resolve.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Mark as Resolved</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="auth-error" style={{ margin: '0 0 16px 0' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Resolution Notes *</label>
              <textarea
                className="form-input"
                style={{ resize: 'vertical', minHeight: 100 }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Describe what was fixed…"
                rows={4}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--green)' }} disabled={submitting}>
              {submitting ? 'Saving…' : 'Resolve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── REPORT ISSUE MODAL ───────────────────────────────────── */
function ReportIssueModal({ onClose, onSuccess }) {
  const [assets, setAssets]         = useState([]);
  const [form, setForm]             = useState({ assetId: '', description: '', priority: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    assetAPI.getAll().then(r => {
      const all = r.data || [];
      setAssets(all.filter(a => a.status !== 'RETIRED'));
    }).catch(() => {});
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.assetId) { setError('Select an asset.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    setSubmitting(true); setError('');
    try {
      await issueAPI.report(form.assetId, form.description.trim(), form.priority);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to report issue.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Report Issue</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="auth-error" style={{ margin: '0 0 16px 0' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Asset *</label>
              <select className="form-input" value={form.assetId} onChange={e => setForm({ ...form, assetId: e.target.value })}>
                <option value="">-- Select Asset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {(a.status || '').replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input"
                style={{ resize: 'vertical', minHeight: 90 }}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the problem…"
                rows={3}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Reporting…' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ────────────────────────────────────────────── */
const TABS = ['ALL', 'OPEN', 'ASSIGNED', 'RESOLVED'];

const Issues = () => {
  const { user } = useAuth();
  const role        = user?.role;
  const isAdmin     = role === 'ADMIN';
  const isLabIncharge = role === 'LAB_INCHARGE';
  const isTechnician = role === 'TECHNICIAN';
  const canManage   = isAdmin || isLabIncharge;
  const canReport   = role !== 'TECHNICIAN';

  const [issues, setIssues]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState('ALL');
  const [assignIssueId, setAssignIssueId] = useState(null);
  const [resolveIssueId, setResolveIssueId] = useState(null);
  const [showReport, setShowReport]       = useState(false);
  const [toast, setToast]                 = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await issueAPI.getAll();
      setIssues(res.data || []);
    } catch {
      setIssues([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    document.title = 'Maintenance — AssetFlow';
    fetchData();
  }, [fetchData]);

  const filtered = tab === 'ALL' ? issues : issues.filter(i => i.status === tab);
  const openCount = issues.filter(i => i.status === 'OPEN').length;

  return (
    <div className="page-container">
      {toast.msg && (
        <div className={`sys-toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      {assignIssueId && (
        <AssignModal issueId={assignIssueId} onClose={() => setAssignIssueId(null)} onSuccess={() => {
          setAssignIssueId(null);
          showToast('Technician assigned successfully.');
          fetchData();
        }} />
      )}

      {resolveIssueId && (
        <ResolveModal issueId={resolveIssueId} onClose={() => setResolveIssueId(null)} onSuccess={() => {
          setResolveIssueId(null);
          showToast('Issue resolved successfully.');
          fetchData();
        }} />
      )}

      {showReport && (
        <ReportIssueModal onClose={() => setShowReport(false)} onSuccess={() => {
          setShowReport(false);
          showToast('Issue reported successfully.');
          fetchData();
        }} />
      )}

      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Maintenance</h1>
          {openCount > 0 && <span className="badge-count">{openCount} open</span>}
        </div>
        {canReport && (
          <button className="btn btn-primary" onClick={() => setShowReport(true)}>
            + Report Issue
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
              <th>Description</th>
              <th>Priority</th>
              <th>Reported By</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}><td colSpan="7"><div className="shimmer-row"></div></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" className="empty-state-svg" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    <h3>No {tab === 'ALL' ? '' : tab.toLowerCase() + ' '}issues</h3>
                    <p>There are no maintenance issues matching this filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(issue => (
                <tr key={issue.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{issue.assetName || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                      {issue.assetId?.toString().substring(0, 8)}…
                    </div>
                  </td>
                  <td>
                    <div style={{
                      maxWidth: 260, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: 'var(--text-secondary)', fontSize: 13,
                    }}>
                      {issue.description}
                    </div>
                  </td>
                  <td><PriorityBadge priority={issue.priority} /></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {issue.reportedByName || '—'}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {issue.technicianName
                      ? <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{issue.technicianName}</span>
                      : <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>}
                  </td>
                  <td><StatusBadge status={issue.status} /></td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {isAdmin && issue.status === 'OPEN' && (
                        <button className="btn btn-ghost" onClick={() => setAssignIssueId(issue.id)}>Assign Tech</button>
                      )}
                      {(isTechnician || isAdmin) && issue.status === 'ASSIGNED' && (
                        <button
                          className="btn btn-ghost"
                          style={{ color: '#276749', borderColor: '#9ae6b4' }}
                          onClick={() => setResolveIssueId(issue.id)}
                        >Resolve</button>
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

export default Issues;
