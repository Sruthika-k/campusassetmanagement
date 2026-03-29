import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetAPI, borrowAPI, departmentAPI, roomAPI, issueAPI, reservationAPI, historyAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import './Assets.css';

/* ─────────────────────────────────────────────────────────────
   STATUS badge colours
───────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const normalized = status || 'RETIRED';
  return ( // Handled via CSS classes
    <span className={`status-pill status-${normalized}`}>
      {normalized.replace(/_/g, ' ')}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADD ASSET MODAL
───────────────────────────────────────────────────────────── */
const STATUSES = ['AVAILABLE', 'BORROWED', 'RESERVED', 'IN_USE', 'UNDER_MAINTENANCE', 'RETIRED'];

function AddAssetModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', category: '', serialNo: '',
    status: 'AVAILABLE', condition: 'GOOD', borrowable: true,
    departmentId: '', roomId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms]             = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    departmentAPI.getAll().then(r => setDepartments(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.departmentId) {
      roomAPI.getByDepartment(form.departmentId).then(r => setRooms(r.data || [])).catch(() => {});
    } else {
      setRooms([]);
    }
  }, [form.departmentId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.category) { setError('Name and Category required.'); return; }
    setSubmitting(true); setError('');
    try {
      await assetAPI.create(form); 
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Asset</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="auth-error" style={{margin:'0 0 16px 0'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Asset Name *</label>
              <input type="text" className="form-input" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="e.g. Dell Monitor P2419" required />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input type="text" className="form-input" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} placeholder="e.g. IT Equipment" required />
              </div>
              <div className="form-group">
                <label className="form-label">Serial No</label>
                <input type="text" className="form-input" value={form.serialNo} onChange={e=>setForm({...form, serialNo: e.target.value})} placeholder="e.g. SN-12345" />
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={form.departmentId} onChange={e=>setForm({...form, departmentId: e.target.value, roomId: ''})}>
                  <option value="">-- Select --</option>
                  {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Room</label>
                <select className="form-input" value={form.roomId} onChange={e=>setForm({...form, roomId: e.target.value})} disabled={!form.departmentId}>
                  <option value="">{form.departmentId ? '-- Select --' : 'Select department first'}</option>
                  {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                  <option value="AVAILABLE">Available</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-input" value={form.condition} onChange={e=>setForm({...form, condition: e.target.value})}>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{flexDirection:'row', alignItems:'center', gap:8}}>
              <input type="checkbox" id="borrowableCheck" checked={form.borrowable} onChange={e=>setForm({...form, borrowable: e.target.checked})} style={{width:16, height:16}}/>
              <label htmlFor="borrowableCheck" style={{margin:0, fontSize:13, color:'var(--text-primary)'}}>Available for borrowing</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditAssetModal({ asset, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: asset.name || '',
    category: asset.category || '',
    serialNo: asset.serialNo || '',
    status: asset.status || 'AVAILABLE',
    condition: asset.condition || 'GOOD',
    borrowable: asset.borrowable !== undefined ? asset.borrowable : true,
    departmentId: asset.departmentId || '',
    roomId: asset.roomId || '',
  });
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms]             = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    departmentAPI.getAll().then(r => setDepartments(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.departmentId) {
      roomAPI.getByDepartment(form.departmentId).then(r => setRooms(r.data || [])).catch(() => {});
    } else {
      setRooms([]);
    }
  }, [form.departmentId]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.category) { setError('Name and Category required.'); return; }
    setSubmitting(true); setError('');
    try {
      await assetAPI.update(asset.id, form); 
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Asset</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="auth-error" style={{margin:'0 0 16px 0'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Asset Name *</label>
              <input type="text" className="form-input" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input type="text" className="form-input" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Serial No</label>
                <input type="text" className="form-input" value={form.serialNo} onChange={e=>setForm({...form, serialNo: e.target.value})} />
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={form.departmentId} onChange={e=>setForm({...form, departmentId: e.target.value, roomId: ''})}>
                  <option value="">-- Select --</option>
                  {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Room</label>
                <select className="form-input" value={form.roomId} onChange={e=>setForm({...form, roomId: e.target.value})} disabled={!form.departmentId}>
                  <option value="">{form.departmentId ? '-- Select --' : 'Select department first'}</option>
                  {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                  <option value="AVAILABLE">Available</option>
                  <option value="BORROWED">Borrowed</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="IN_USE">In Use</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-input" value={form.condition} onChange={e=>setForm({...form, condition: e.target.value})}>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{flexDirection:'row', alignItems:'center', gap:8}}>
              <input type="checkbox" id="editBorrowableCheck" checked={form.borrowable} onChange={e=>setForm({...form, borrowable: e.target.checked})} style={{width:16, height:16}}/>
              <label htmlFor="editBorrowableCheck" style={{margin:0, fontSize:13, color:'var(--text-primary)'}}>Available for borrowing</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REPORT ISSUE MODAL
───────────────────────────────────────────────────────────── */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '') || 'http://localhost:8080'

function AssetQrModal({ asset, onClose, onRegenerated, showToast }) {
  const [regenLoading, setRegenLoading] = useState(false);
  const [cacheKey, setCacheKey] = useState(0);

  const openLabel = () => {
    window.open(assetAPI.getQrLabelUrl(asset.id), '_blank', 'noopener,noreferrer');
  };

  const handleRegenerate = async () => {
    setRegenLoading(true);
    try {
      await assetAPI.regenerateQr(asset.id);
      setCacheKey((k) => k + 1);
      onRegenerated();
      showToast('QR code regenerated');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to regenerate QR', 'error');
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">QR — {asset.name}</h2>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          {asset?.qrCodePath?.startsWith('data:') ? (
            <img
              src={asset.qrCodePath}
              alt="QR Code"
              style={{ width: 200, height: 200 }}
            />
          ) : asset?.qrCodeBase64 ? (
            <img
              src={'data:image/png;base64,' + asset.qrCodeBase64}
              alt="QR Code"
              style={{ width: 200, height: 200 }}
            />
          ) : (
            <p style={{ color: '#8891aa' }}>
              No QR code. Click Regenerate QR to generate one.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            <a
              href={assetAPI.getQrLabelUrl(asset.id)}
              download=""
              className="btn btn-secondary"
              style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
            >
              Download Label
            </a>
            <button type="button" className="btn btn-secondary" onClick={openLabel}>
              🏷️ Print Label
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={regenLoading}
              onClick={handleRegenerate}
            >
              {regenLoading ? 'Regenerating…' : 'Regenerate QR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportIssueModal({ assetName, assetId, onClose, onSuccess }) {
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!description.trim()) { setError('Please describe the issue.'); return; }
    setSubmitting(true); setError('');
    
    console.log('Reporting issue for asset:', assetId, 'Description:', description.trim());
    
    try {
      const response = await issueAPI.report(assetId, description.trim());
      console.log('Issue reported successfully:', response.data);
      onSuccess('Issue reported successfully');
    } catch (err) {
      console.error('Failed to report issue:', err);
      setError(err?.response?.data?.message || 'Failed to report issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Report Issue</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="auth-error" style={{margin:'0 0 16px 0'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Asset</label>
              <div className="form-input" style={{ opacity: 0.7, pointerEvents: 'none' }}>{assetName}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" style={{ resize: 'vertical', minHeight: 90 }} value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   MAIN ASSETS PAGE
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   ASSET HISTORY MODAL
───────────────────────────────────────────────────────────── */
function AssetHistoryModal({ assetId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyAPI.getAssetHistory(assetId)
      .then(res => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [assetId]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title">Asset History</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading ? (
            <div>Loading history...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20 }}>No history for this asset.</div>
          ) : (
            <div className="log-list">
              {history.map(event => (
                <div key={event.id} className="log-item">
                  <div className="log-indicator" style={{ backgroundColor: event.type?.includes('CREATED') ? '#48bb78' : '#cbd5e0' }}></div>
                  <div className="log-content">
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{event.type?.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0' }}>{event.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {event.actorEmail || 'System'} • {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Assets = () => {
  const { user, hasRole, isAdmin: contextIsAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [reportAsset, setReportAsset] = useState(null);
  const [editAsset, setEditAsset] = useState(null);
  const [showHistory, setShowHistory] = useState(null);
  const [qrModalAsset, setQrModalAsset] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });

  // Bug 2 fix: Load user from localStorage to be sure
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCurrentUser(parsed);
      setUserRole(parsed.role);
      console.log('User role loaded:', parsed.role);
    }
  }, []);

  // Filtering states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assetAPI.getAll();
      setAssets(response.data || []);
    } catch (err) {
      showToast('Failed to load assets', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Assets - AssetFlow';
    fetchAssets();
  }, [fetchAssets]);

  // Apply filters client-side
  useEffect(() => {
    let result = assets;

    if (statusFilter !== 'ALL') {
      result = result.filter(a => a.status === statusFilter);
    }

    if (search.trim()) {
       const q = search.toLowerCase();
       result = result.filter(a => 
         a.name?.toLowerCase().includes(q) || 
         a.category?.toLowerCase().includes(q) ||
         a.serialNo?.toLowerCase().includes(q) ||
         a.departmentName?.toLowerCase().includes(q)
       );
     }

     setFilteredAssets(result);
   }, [assets, search, statusFilter]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const handlePrintQR = (assetId) => {
    const url = assetAPI.getQrLabelUrl(assetId);
    window.open(url, '_blank');
  };

  const handleBorrow = async (id, name) => {
    if (!window.confirm(`Request to borrow ${name}?`)) return;
    try {
      await borrowAPI.request(id);
      showToast('Borrow request submitted');
      fetchAssets();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to request borrow', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await assetAPI.delete(id);
      showToast('Asset deleted');
      fetchAssets();
    } catch (err) {
      showToast('Failed to delete asset', 'error');
    }
  };

  const isAdmin = userRole === 'ADMIN';
  const isTechnician = userRole === 'TECHNICIAN';
  const canBorrow = (userRole === 'FACULTY' || userRole === 'STUDENT') && true; // borrowable check in row

  return (
    <div className="page-container">
      {toast.msg && (
        <div className={`sys-toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Assets</h1>
          <span className="badge-count">{filteredAssets.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setShowScanner(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
            Scan QR
          </button>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Asset
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            className="form-input search-input" 
            placeholder="Search by name, category, or serial..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            className="form-input filter-select" 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BORROWED">Borrowed</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Serial No</th>
              <th>Department</th>
              <th>Room</th>
              <th>Status</th>
              <th>Condition</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan="8"><div className="shimmer-row"></div></td></tr>
              ))
            ) : filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <h3>No assets found</h3>
                    <p>Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAssets.map(asset => {
                const canBorrowRow = (userRole === 'FACULTY' || userRole === 'STUDENT') && asset.status === 'AVAILABLE' && asset.borrowable;
                const canReportRow = !isTechnician && asset.status !== 'UNDER_MAINTENANCE';

                return (
                  <tr key={asset.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{asset.name}</div>
                    </td>
                    <td>{asset.category}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{asset.serialNo || '—'}</td>
                    <td>{asset.departmentName || '—'}</td>
                    <td>{asset.roomName || '—'}</td>
                    <td><StatusBadge status={asset.status} /></td>
                    <td>
                      <span style={{ 
                        fontSize: 12, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                        backgroundColor: asset.condition === 'GOOD' ? '#e6fffa' : asset.condition === 'FAIR' ? '#fffaf0' : '#fff5f5',
                        color: asset.condition === 'GOOD' ? '#2c7a7b' : asset.condition === 'FAIR' ? '#b7791f' : '#c53030'
                      }}>
                        {asset.condition || 'GOOD'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost" onClick={() => setShowHistory(asset.id)}>History</button>
                        
                        {canBorrowRow && (
                          <button className="btn btn-ghost" onClick={() => handleBorrow(asset.id, asset.name)}>Borrow</button>
                        )}
                        
                        {canReportRow && (
                          <button className="btn btn-ghost" onClick={() => setReportAsset({ id: asset.id, name: asset.name })}>Report</button>
                        )}

                        {userRole === 'LAB_INCHARGE' && (
                          <button className="btn btn-ghost" onClick={() => navigate('/borrow')}>Approve Borrow</button>
                        )}

                        {isAdmin && (
                          <>
                            <button className="btn btn-ghost" onClick={() => setEditAsset(asset)}>Edit</button>
                            <button className="btn btn-ghost" onClick={() => setQrModalAsset(asset)} title="Preview, print, or regenerate">View QR</button>
                            <button className="btn btn-ghost" onClick={() => handlePrintQR(asset.id)}>🏷️ Print Label</button>
                            <button className="btn btn-ghost destructive" onClick={() => handleDelete(asset.id, asset.name)}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddAssetModal onClose={() => setShowModal(false)} onSuccess={() => {
          setShowModal(false);
          showToast('Asset created.');
          fetchAssets();
        }} />
      )}

      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}

      {editAsset && (
        <EditAssetModal asset={editAsset} onClose={() => setEditAsset(null)} onSuccess={() => {
          setEditAsset(null);
          showToast('Asset updated.');
          fetchAssets();
        }} />
      )}

      {reportAsset && (
        <ReportIssueModal 
          assetName={reportAsset.name} 
          assetId={reportAsset.id} 
          onClose={() => setReportAsset(null)} 
          onSuccess={(msg) => {
            setReportAsset(null);
            showToast(msg);
          }} 
        />
      )}

      {showHistory && (
        <AssetHistoryModal assetId={showHistory} onClose={() => setShowHistory(null)} />
      )}

      {qrModalAsset && (
        <AssetQrModal
          asset={qrModalAsset}
          onClose={() => setQrModalAsset(null)}
          onRegenerated={() => fetchAssets()}
          showToast={showToast}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .log-item { display: flex; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
        .log-indicator { width: 8px; height: 8px; borderRadius: 50%; marginTop: 6px; flex-shrink: 0; }
        .sys-toast.toast-error { background: #fff5f5; border-color: #feb2b2; color: #c53030; }
      `}} />
    </div>
  );
};

export default Assets;
