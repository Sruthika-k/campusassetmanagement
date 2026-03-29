import { useState, useRef } from 'react'
import jsQR from 'jsqr'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function QRScanner({ onClose }) {
  const [tab, setTab] = useState('upload')
  const [error, setError] = useState(null)
  const [manualId, setManualId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const verifyAndNavigate = async (uuid) => {
    setVerifying(true)
    setError(null)
    try {
      await api.get(`/scan/${uuid}`)
      navigate('/scan/' + uuid)
      onClose()
    } catch (err) {
      if (err.response?.status === 404) {
        setError(
          'QR code scanned but asset not found in system.\nThe asset may have been removed.'
        )
      } else {
        setError('Could not verify asset. Check your connection and try again.')
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, or WEBP).')
      return
    }
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
          const url = code.data
          const match = url.match(/\/scan\/([a-f0-9-]+)/i)
          if (match) {
            verifyAndNavigate(match[1])
          } else {
            setError(
              'QR code found but it does not link to an AssetFlow asset.\nMake sure you are scanning an AssetFlow QR label.'
            )
          }
        } else {
          setError(
            'No QR code detected. Tips:\n• Make sure the QR code fills most of the image\n• Use good lighting — avoid shadows\n• Try a higher resolution photo'
          )
        }
      }
      img.onerror = () => setError('Could not read this image. Try another file.')
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleManualGo = () => {
    const id = manualId.trim()
    if (!id) return
    verifyAndNavigate(id)
  }

  return (
    <div style={scannerStyles.backdrop} onClick={onClose}>
      <div style={scannerStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={scannerStyles.header}>
          <span style={scannerStyles.title}>Scan Asset QR</span>
          <button style={scannerStyles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={scannerStyles.tabs}>
          <button
            style={{
              ...scannerStyles.tab,
              ...(tab === 'upload' ? scannerStyles.activeTab : {}),
            }}
            onClick={() => setTab('upload')}
          >
            Upload Image
          </button>
          <button
            style={{
              ...scannerStyles.tab,
              ...(tab === 'manual' ? scannerStyles.activeTab : {}),
            }}
            onClick={() => setTab('manual')}
          >
            Enter ID
          </button>
        </div>

        {tab === 'upload' && (
          <div style={scannerStyles.body}>
            <div
              style={{
                ...scannerStyles.dropZone,
                opacity: verifying ? 0.6 : 1,
                pointerEvents: verifying ? 'none' : 'auto',
              }}
              onClick={() => !verifying && fileRef.current.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div style={scannerStyles.dropIcon}>📷</div>
              <p style={scannerStyles.dropText}>Click or drag an image here</p>
              <p style={scannerStyles.dropSubtext}>PNG, JPG, or WEBP accepted</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
            </div>
            {verifying && (
              <div style={scannerStyles.hint}>Verifying asset…</div>
            )}
            {error && <div style={scannerStyles.error}>{error}</div>}
            <p style={scannerStyles.hint}>
              Take a photo of the QR label on the physical asset and upload or drop it here.
            </p>
          </div>
        )}

        {tab === 'manual' && (
          <div style={scannerStyles.body}>
            <label style={scannerStyles.label}>Asset ID or UUID</label>
            <input
              style={scannerStyles.input}
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="e.g. 370e3984-9d5e-47dd..."
              onKeyDown={(e) => e.key === 'Enter' && handleManualGo()}
              disabled={verifying}
            />
            <button
              style={scannerStyles.goBtn}
              onClick={handleManualGo}
              disabled={!manualId.trim() || verifying}
            >
              {verifying ? 'Verifying…' : 'Go to Asset →'}
            </button>
            {error && <div style={scannerStyles.error}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

const scannerStyles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a1d27',
    border: '1px solid #ffffff12',
    borderRadius: 20,
    width: '90%',
    maxWidth: 420,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #ffffff12',
  },
  title: {
    color: '#f0f2f8',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: 16,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8891aa',
    cursor: 'pointer',
    fontSize: 16,
    padding: 4,
  },
  tabs: {
    display: 'flex',
    padding: '12px 24px 0',
    gap: 8,
  },
  tab: {
    background: 'transparent',
    border: '1px solid #ffffff12',
    color: '#8891aa',
    padding: '6px 16px',
    borderRadius: 20,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  activeTab: {
    background: '#4f8ef720',
    border: '1px solid #4f8ef740',
    color: '#4f8ef7',
  },
  body: {
    padding: '20px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  dropZone: {
    border: '2px dashed #ffffff20',
    borderRadius: 12,
    padding: '32px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dropIcon: { fontSize: 32, marginBottom: 8 },
  dropText: {
    color: '#f0f2f8',
    fontSize: 14,
    fontWeight: 500,
    margin: '0 0 4px',
  },
  dropSubtext: {
    color: '#555d78',
    fontSize: 12,
    margin: 0,
  },
  hint: {
    color: '#555d78',
    fontSize: 12,
    textAlign: 'center',
    margin: 0,
  },
  error: {
    background: '#f8717115',
    border: '1px solid #f8717130',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    whiteSpace: 'pre-line',
  },
  label: {
    color: '#8891aa',
    fontSize: 13,
    fontWeight: 500,
  },
  input: {
    background: '#21253a',
    border: '1px solid #ffffff20',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f0f2f8',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
  },
  goBtn: {
    background: '#4f8ef7',
    color: 'white',
    border: 'none',
    padding: '11px 20px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },
}
