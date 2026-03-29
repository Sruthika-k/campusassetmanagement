import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import '../Assets.css';

const ROLES = ['ADMIN', 'LAB_INCHARGE', 'FACULTY', 'STUDENT', 'TECHNICIAN'];

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      await userAPI.updateRole(userId, newRole);
      showToastMsg('Role updated');
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="page-container">
      {toast && <div className="sys-toast">✅ {toast}</div>}

      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Users</h1>
          <span className="badge-count">{users.length}</span>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5"><div className="shimmer-row"></div></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5"><div className="empty-state"><h3>No users found.</h3></div></td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--bg-hover)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)'
                      }}>
                        {getUserInitials(u.name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name} {u.id === currentUser?.id && '(You)'}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`status-pill status-${u.role}`}>
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.id !== currentUser?.id && (
                      <select 
                        className="form-input" 
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    )}
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

export default Users;
