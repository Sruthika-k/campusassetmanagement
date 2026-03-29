import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { createAsset } from '../api/assets';

export default function CreateAsset() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serialNumber: '',
    condition: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Asset name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newAsset = await createAsset(formData);
      navigate(`/assets/${newAsset.id}`);
    } catch (err) {
      setError('Failed to create asset. Please try again.');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Create New Asset
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Asset Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                helperText="Enter a descriptive name for the asset"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                helperText="e.g., Equipment, Vehicle, Property"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                helperText="Unique serial number for tracking"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                helperText="e.g., Excellent, Good, Fair"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
                variant="outlined"
                helperText="e.g., Active, Maintenance, Retired"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? 'Creating...' : 'Create Asset'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
