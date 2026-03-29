import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './ScanAsset.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '') || 'http://localhost:8080'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function ScanPage() {
  const { assetId } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [issueDesc, setIssueDesc] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const fetchAsset = useCallback(async () => {
    setFetchError(null)
    setAsset(null)
    setError(null)

    if (!assetId || !UUID_RE.test(assetId)) {
      setFetchError('not_found')
      setLoading(false)
      return
    }

    const started = Date.now()
    setLoading(true)
    try {
      const res = await api.get(`/scan/${assetId}`)
      const elapsed = Date.now() - started
      if (elapsed < 500) {
        await new Promise((r) => setTimeout(r, 500 - elapsed))
      }
      setAsset(res.data)
    } catch (err) {
      const elapsed = Date.now() - started
      if (elapsed < 500) {
        await new Promise((r) => setTimeout(r, 500 - elapsed))
      }
      const status = err.response?.status
      const isNetwork =
        !err.response &&
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error')
      if (status === 404) {
        setFetchError('not_found')
      } else if (isNetwork) {
        setFetchError('network')
      } else {
        setFetchError('not_found')
      }
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    fetchAsset()
  }, [fetchAsset, retryCount])

  const handleRetry = () => setRetryCount((c) => c + 1)

  const qrImgSrc =
    asset?.qrCodeUrl ||
    (asset?.qrCodePath?.startsWith('data:')
      ? asset.qrCodePath
      : asset?.qrCodePath
        ? BACKEND_URL + (asset.qrCodePath.startsWith('/') ? asset.qrCodePath : '/' + asset.qrCodePath)
        : null)

  const handleBorrow = async () => {
    try {
      setActionLoading(true)
      setError(null)
      await api.post('/borrow/request', { assetId })
      setActionSuccess('Borrow request submitted! Waiting for approval.')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit borrow request.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReportIssue = async () => {
    if (!issueDesc.trim()) return
    try {
      setActionLoading(true)
      setError(null)
      await api.post('/issues', {
        assetId,
        description: issueDesc.trim(),
        priority: 'MEDIUM',
      })
      setActionSuccess('Issue reported successfully.')
      setShowReportForm(false)
      setIssueDesc('')
      fetchAsset()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report issue.')
    } finally {
      setActionLoading(false)
    }
  }

  const statusColors = {
    AVAILABLE: { bg: '#34d39915', text: '#34d399', border: '#34d39930' },
    BORROWED: { bg: '#fbbf2415', text: '#fbbf24', border: '#fbbf2430' },
    UNDER_MAINTENANCE: { bg: '#f8717115', text: '#f87171', border: '#f8717130' },
    RETIRED: { bg: '#ffffff10', text: '#8891aa', border: '#ffffff20' },
    IN_USE: { bg: '#4f8ef715', text: '#4f8ef7', border: '#4f8ef730' },
    RESERVED: { bg: '#a78bfa15', text: '#a78bfa', border: '#a78bfa30' },
  }

  const sc = statusColors[asset?.status] || statusColors.AVAILABLE

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.topBar}>
          <span style={styles.logo}>⬡ AssetFlow</span>
        </div>
        <div className="scan-page-skeleton" style={{ padding: 28 }}>
          <div className="scan-skeleton-line scan-skeleton-line-lg" style={{ width: '70%' }} />
          <div className="scan-skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="scan-skeleton-line" style={{ width: '40%' }} />
                <div className="scan-skeleton-line" style={{ width: '90%' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (fetchError === 'not_found') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.errorText}>
            This QR code is invalid or the asset has been removed.
          </div>
          <button style={styles.primaryBtn} onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (fetchError === 'network') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.errorText}>
            Could not connect to server. Check your connection.
          </div>
          <button style={styles.primaryBtn} onClick={handleRetry}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <span style={styles.logo}>⬡ AssetFlow</span>
        {user ? (
          <span style={styles.userChip}>{user.name}</span>
        ) : (
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.assetHeader}>
          <h1 style={styles.assetName}>{asset.name}</h1>
          <span
            style={{
              ...styles.statusBadge,
              background: sc.bg,
              color: sc.text,
              border: '1px solid ' + sc.border,
            }}
          >
            {asset.status?.replace(/_/g, ' ')}
          </span>
        </div>

        {asset.qrCodeBase64 ? (
          <img
            src={'data:image/png;base64,' + asset.qrCodeBase64}
            alt="QR Code for this asset"
            style={{ width: 120, height: 120, borderRadius: 8 }}
          />
        ) : (
          <div style={{ 
            width: 120, height: 120, 
            background: '#21253a',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#555d78',
            fontSize: 12
          }}>
            No QR
          </div>
        )}

        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Category</span>
            <span style={styles.infoValue}>{asset.category || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Serial No</span>
            <span style={styles.infoValue}>{asset.serialNo || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Department</span>
            <span style={styles.infoValue}>{asset.department || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Room</span>
            <span style={styles.infoValue}>{asset.room || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Condition</span>
            <span style={styles.infoValue}>{asset.condition || '—'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Asset ID</span>
            <span style={styles.infoValue}>{asset.id?.substring(0, 8).toUpperCase()}</span>
          </div>
        </div>

        <div style={styles.divider} />

        {actionSuccess && <div style={styles.successBox}>{actionSuccess}</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        {!user ? (
          <div style={styles.actionSection}>
            <p style={styles.loginPrompt}>Login to borrow this asset or report an issue.</p>
            <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
              Login to Take Action
            </button>
          </div>
        ) : (
          <div style={styles.actionSection}>
            {(user.role === 'FACULTY' || user.role === 'STUDENT') &&
              asset.status === 'AVAILABLE' &&
              asset.borrowable && (
                <button
                  style={{ ...styles.primaryBtn, opacity: actionLoading ? 0.7 : 1 }}
                  onClick={handleBorrow}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Submitting...' : '📦 Request to Borrow'}
                </button>
              )}

            {user.role !== 'TECHNICIAN' && asset.status !== 'RETIRED' && (
              <button style={styles.secondaryBtn} onClick={() => setShowReportForm(!showReportForm)}>
                🔧 Report Issue
              </button>
            )}

            {user.role === 'TECHNICIAN' && asset.status === 'UNDER_MAINTENANCE' && (
              <button style={styles.secondaryBtn} onClick={() => navigate('/issues')}>
                View Repair Task
              </button>
            )}

            {user.role === 'ADMIN' && (
              <button style={styles.secondaryBtn} onClick={() => navigate('/assets')}>
                Manage in Admin
              </button>
            )}

            {showReportForm && (
              <div style={styles.reportForm}>
                <label style={styles.formLabel}>Describe the issue:</label>
                <textarea
                  style={styles.textarea}
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="e.g. Screen not turning on, cable missing..."
                  rows={3}
                />
                <div style={styles.formButtons}>
                  <button
                    style={{ ...styles.primaryBtn, opacity: actionLoading ? 0.7 : 1 }}
                    onClick={handleReportIssue}
                    disabled={actionLoading || !issueDesc.trim()}
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button style={styles.ghostBtn} onClick={() => setShowReportForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={styles.instructions}>
          <p style={styles.instructionsP}>
            📱 Tip: Bookmark this page to quickly report issues or request this asset again.
          </p>
        </div>

        <div style={styles.footer}>Powered by AssetFlow · Campus Asset Management</div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 16px 40px',
    fontFamily: "'DM Sans', sans-serif",
  },
  topBar: {
    width: '100%',
    maxWidth: 440,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
  },
  logo: {
    color: '#4f8ef7',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: 18,
  },
  userChip: {
    background: '#1a1d27',
    border: '1px solid #ffffff12',
    color: '#8891aa',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 13,
  },
  loginBtn: {
    background: '#4f8ef7',
    color: 'white',
    border: 'none',
    padding: '6px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  card: {
    background: '#1a1d27',
    border: '1px solid #ffffff12',
    borderRadius: 20,
    padding: '28px 24px',
    width: '100%',
    maxWidth: 440,
  },
  assetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  assetName: {
    color: '#f0f2f8',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: 22,
    margin: 0,
    lineHeight: 1.3,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px 16px',
    marginBottom: 24,
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  infoLabel: {
    color: '#555d78',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  infoValue: {
    color: '#f0f2f8',
    fontSize: 14,
  },
  divider: {
    height: 1,
    background: '#ffffff12',
    marginBottom: 20,
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  primaryBtn: {
    background: '#4f8ef7',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    width: '100%',
    transition: 'all 0.15s ease',
  },
  secondaryBtn: {
    background: 'transparent',
    color: '#8891aa',
    border: '1px solid #ffffff20',
    padding: '12px 20px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    width: '100%',
    transition: 'all 0.15s ease',
  },
  ghostBtn: {
    background: 'transparent',
    color: '#555d78',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    fontSize: 13,
  },
  reportForm: {
    background: '#21253a',
    border: '1px solid #ffffff12',
    borderRadius: 12,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  formLabel: {
    color: '#8891aa',
    fontSize: 13,
    fontWeight: 500,
  },
  textarea: {
    background: '#1a1d27',
    border: '1px solid #ffffff20',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#f0f2f8',
    fontSize: 14,
    resize: 'vertical',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  formButtons: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  successBox: {
    background: '#34d39915',
    border: '1px solid #34d39930',
    color: '#34d399',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  errorBox: {
    background: '#f8717115',
    border: '1px solid #f8717130',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  loginPrompt: {
    color: '#8891aa',
    fontSize: 14,
    textAlign: 'center',
    margin: '0 0 12px',
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    padding: '20px 0',
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    color: '#555d78',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
  },
  instructions: {
    marginTop: 20,
    padding: '12px 14px',
    borderRadius: 10,
    background: '#21253a',
    border: '1px solid #ffffff10',
  },
  instructionsP: {
    margin: 0,
    color: '#8891aa',
    fontSize: 13,
    lineHeight: 1.5,
    textAlign: 'center',
  },
}
