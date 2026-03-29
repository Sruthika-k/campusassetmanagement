import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Users - AssetFlow';
    if (!hasRole(['ADMIN'])) {
      navigate('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await userAPI.getAll();
        setUsers(response.data || []);
      } catch (error) {
        // Silently fail or set an error state if needed
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [hasRole, navigate]);

  return (
    <>
      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Users</h1>
          <span className="badge-count">{users.length} registered</span>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Account Hash</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="4"><div className="shimmer-row"></div></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" className="empty-state-svg" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <h3>No Users Found</h3>
                    <p>There are no registered users.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{fontWeight: 500}}>{u.name || 'Unknown'}</div>
                  </td>
                  <td style={{color: 'var(--text-secondary)'}}>{u.email}</td>
                  <td>
                    <span style={{
                      fontSize: 10,
                      color: 'var(--text-tertiary)',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      padding: '2px 6px',
                      borderRadius: 12,
                      textTransform: 'uppercase'
                    }}>{u.role}</span>
                  </td>
                  <td style={{fontFamily:'monospace', color:'var(--text-tertiary)'}}>{u.id.substring(0,8)}...</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Users;
