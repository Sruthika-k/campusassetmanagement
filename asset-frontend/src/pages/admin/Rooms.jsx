import React, { useState, useEffect, useCallback } from 'react';
import { roomAPI, departmentAPI } from '../../api/api';
import '../Assets.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', departmentId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roomAPI.getAll();
      setRooms(res.data || []);
      setFilteredRooms(res.data || []);
    } catch (err) {
      console.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments');
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchDepartments();
  }, [fetchRooms, fetchDepartments]);

  useEffect(() => {
    if (deptFilter === 'ALL') {
      setFilteredRooms(rooms);
    } else {
      setFilteredRooms(rooms.filter(r => r.departmentId === deptFilter));
    }
  }, [rooms, deptFilter]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.departmentId) return;
    setSubmitting(true);
    try {
      await roomAPI.create({ 
        name: form.name.trim(), 
        department: { id: form.departmentId } 
      });
      setForm({ name: '', departmentId: '' });
      setShowModal(false);
      showToastMsg('Room created successfully');
      fetchRooms();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await roomAPI.delete(id);
      showToastMsg('Room deleted');
      fetchRooms();
    } catch (err) {
      alert(err?.response?.data || 'Failed to delete room. Reassign assets before deleting room.');
    }
  };

  return (
    <div className="page-container">
      {toast && <div className="sys-toast">✅ {toast}</div>}

      <div className="page-header">
        <div className="page-header-title">
          <h1 className="page-title">Rooms</h1>
          <span className="badge-count">{rooms.length}</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Room
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginRight: 12 }}>Filter by Department:</label>
          <select className="form-input filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="ALL">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Room</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddRoom}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Room Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select 
                    className="form-input" 
                    value={form.departmentId} 
                    onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || !form.name.trim() || !form.departmentId}>
                  {submitting ? 'Creating...' : 'Create Room'}
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
              <th>Room Name</th>
              <th>Department</th>
              <th>Assets Count</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4"><div className="shimmer-row"></div></td></tr>
            ) : filteredRooms.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">
                    <h3>No rooms yet.</h3>
                    <p>Create your first room.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRooms.map(room => (
                <tr key={room.id}>
                  <td style={{ fontWeight: 500 }}>{room.name}</td>
                  <td>{room.departmentName}</td>
                  <td>{room.assetCount} assets</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost destructive" onClick={() => handleDelete(room.id, room.name)}>Delete</button>
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

export default Rooms;
