import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { getAsset } from '../api/assets';

export default function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAsset(id);
      setAsset(data);
    } catch (err) {
      setError('Failed to load asset details. Please try again.');
      
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'retired':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !asset) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              size="small" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          }
        >
          {error || 'Asset not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {asset.name || 'Untitled Asset'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/assets/${asset.id}/edit`)}
          >
            Edit Asset
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Asset Information
            </Typography>
            
            <Grid container spacing={3}>
              {asset.name && (
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Asset Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {asset.name}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {asset.category && (
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Category
                    </Typography>
                    <Typography variant="body1">
                      {asset.category}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {asset.serialNumber && (
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Serial Number
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {asset.serialNumber}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {asset.condition && (
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Condition
                    </Typography>
                    <Typography variant="body1">
                      {asset.condition}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {asset.status && (
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Status
                    </Typography>
                    <Chip 
                      label={asset.status}
                      color={getStatusColor(asset.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
              )}
              
              {asset.createdAt && (
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Created Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(asset.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              QR Code
            </Typography>
            
            {asset.qrCode ? (
              <Box sx={{ mb: 2 }}>
                <img 
                  src={asset.qrCode} 
                  alt="Asset QR Code"
                  style={{ 
                    width: '100%', 
                    maxWidth: '200px',
                    height: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  width: 200, 
                  height: 200, 
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <QrCodeIcon sx={{ fontSize: 60, color: 'grey.400' }} />
              </Box>
            )}
            
            <Typography variant="caption" color="text.secondary">
              Scan this QR code to view asset details
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
