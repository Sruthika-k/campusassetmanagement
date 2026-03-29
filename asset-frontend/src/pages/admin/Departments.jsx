import React, { useState, useEffect, useCallback } from 'react';
import { departmentAPI } from '../../api/api';
import '../Assets.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await departmentAPI.getAll();
      setDepartments(res.data || []);
    } catch (err) {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setSubmitting(true);
    try {
      await departmentAPI.create({ name: newDeptName.trim() });
      setNewDeptName('');
      setShowModal(false);
      showToastMsg('Department created successfully');
      fetchDepartments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await departmentAPI.delete(id);
      showToastMsg('Department deleted');
      fetchDepartments();
    } catch (err) {
      alert(err?.response?.data || 'Failed to delete department. Remove all rooms first.');
    }
  };

  return (
    <div className="page-container">
      {toast && <div className="sys-toast">✅ {toast}</div>}

      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Departments</h1>
          <span className="badge-count">{departments.length}</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Department
        </button>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Department</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDepartment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newDeptName} 
                    onChange={e => setNewDeptName(e.target.value)} 
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !newDeptName.trim()}>
                  {submitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rooms Count</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3"><div className="shimmer-row"></div></td></tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan="3">
                  <div className="empty-state">
                    <h3>No departments yet.</h3>
                    <p>Create your first department.</p>
                  </div>
                </td>
              </tr>
            ) : (
              departments.map(dept => (
                <tr key={dept.id}>
                  <td style={{ fontWeight: 500 }}>{dept.name}</td>
                  <td>{dept.roomCount} rooms</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost destructive" onClick={() => handleDelete(dept.id, dept.name)}>Delete</button>
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

export default Departments;
