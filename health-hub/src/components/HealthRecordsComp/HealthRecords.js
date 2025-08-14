import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Heart, Activity, Thermometer, Weight, Plus, Search, 
  Download, Share2, Edit, Trash2, TrendingUp, TrendingDown,
  X, Calendar, FileText
} from 'lucide-react';
import { healthRecordAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './HealthRecords.module.css';

const HealthRecords = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    value: '',
    unit: '',
    date: '',
    status: 'normal',
    notes: ''
  });

  // Fetch health records from API
  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const response = await healthRecordAPI.getAllHealthRecords({ search: searchTerm });
      setHealthRecords(response.data.healthRecords || []);
    } catch (error) {
      console.error('Error fetching health records:', error);
      toast.error('Failed to fetch health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthRecords();
  }, [searchTerm]);

  const filteredRecords = healthRecords.filter(record => 
    record.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    if (type === 'Blood Pressure') return <Heart className={styles.iconSm} />;
    if (type === 'Heart Rate') return <Activity className={styles.iconSm} />;
    if (type === 'Blood Sugar' || type === 'Temperature') return <Thermometer className={styles.iconSm} />;
    if (type === 'Weight') return <Weight className={styles.iconSm} />;
    return <Activity className={styles.iconSm} />;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await healthRecordAPI.updateHealthRecord(editingRecord._id, formData);
        toast.success('Health record updated successfully');
      } else {
        await healthRecordAPI.createHealthRecord(formData);
        toast.success('Health record added successfully');
      }
      setShowAddModal(false);
      setEditingRecord(null);
      setFormData({
        type: '',
        value: '',
        unit: '',
        date: '',
        status: 'normal',
        notes: ''
      });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error saving health record:', error);
      toast.error('Failed to save health record');
    }
  };

  // Handle edit record
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      value: record.value,
      unit: record.unit,
      date: record.date.split('T')[0],
      status: record.status,
      notes: record.notes
    });
    setShowAddModal(true);
  };

  // Handle delete record
  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this health record?')) {
      return;
    }

    try {
      await healthRecordAPI.deleteHealthRecord(recordId);
      toast.success('Health record deleted successfully');
      fetchHealthRecords();
    } catch (error) {
      console.error('Error deleting health record:', error);
      toast.error('Failed to delete health record');
    }
  };

  // Handle share record
  const handleShare = async (record) => {
    try {
      const response = await healthRecordAPI.shareHealthRecord(record._id, {
        email: '',
        permissions: 'view'
      });
      toast.success('Health record shared successfully');
      // You could open the share URL in a new window
      // window.open(response.data.shareUrl, '_blank');
    } catch (error) {
      console.error('Error sharing health record:', error);
      toast.error('Failed to share health record');
    }
  };

  // Handle export records
  const handleExport = async () => {
    try {
      const response = await healthRecordAPI.exportHealthRecords({ format: 'csv' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'health-records.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Health records exported successfully');
    } catch (error) {
      console.error('Error exporting health records:', error);
      toast.error('Failed to export health records');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: '',
      value: '',
      unit: '',
      date: '',
      status: 'normal',
      notes: ''
    });
    setEditingRecord(null);
  };

  if (loading) {
    return (
      <div className={styles.recordsPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading health records...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.recordsPage}>
      <div className={styles.container}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.pageHeader}>
          <div>
            <h1>Health Records</h1>
            <p className={styles.subtitle}>A complete history of your vital health metrics.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className={`${styles.btn} ${styles.btnPrimary} ${styles.addRecordBtn}`}>
            <Plus className={styles.iconSm} />
            <span>Add New Record</span>
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${styles.card} ${styles.mainContentCard}`}>
          <div className={styles.toolbar}>
            <div className={styles.searchBarWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text" placeholder="Search by record type..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.toolbarActions}>
              <button onClick={handleExport} className={`${styles.btn} ${styles.btnSecondary}`}>
                <Download className={styles.iconSm}/>Export All
              </button>
            </div>
          </div>

          <div className={styles.recordsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Record Type</div>
              <div className={styles.tableCell}>Date</div>
              <div className={styles.tableCell}>Value</div>
              <div className={styles.tableCell}>Status</div>
              <div className={styles.tableCell}>Actions</div>
            </div>
            
            {filteredRecords.map(record => (
              <div key={record._id} className={styles.tableRow}>
                <div className={`${styles.tableCell} ${styles.cellType}`}>
                  {getTypeIcon(record.type)}
                  <span>{record.type}</span>
                </div>
                <div className={`${styles.tableCell} ${styles.cellDate}`} data-label="Date">
                  {new Date(record.date).toLocaleDateString()}
                </div>
                <div className={`${styles.tableCell} ${styles.cellValue}`} data-label="Value">
                    {record.value} <span>{record.unit}</span>
                </div>
                <div className={styles.tableCell} data-label="Status">
                  <span className={`${styles.statusBadge} ${styles[record.status]}`}>{record.status}</span>
                </div>
                <div className={`${styles.tableCell} ${styles.cellActions}`}>
                  <button 
                    onClick={() => handleEdit(record)} 
                    className={styles.iconButton} 
                    title="Edit"
                  >
                    <Edit className={styles.iconSm}/>
                  </button>
                  <button 
                    onClick={() => handleShare(record)} 
                    className={styles.iconButton} 
                    title="Share"
                  >
                    <Share2 className={styles.iconSm}/>
                  </button>
                  <button 
                    onClick={() => handleDelete(record._id)} 
                    className={styles.iconButton} 
                    title="Delete"
                  >
                    <Trash2 className={styles.iconSm}/>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className={styles.emptyState}>
              <Activity className={styles.emptyIcon}/>
              <h3>No Health Records Found</h3>
              <p>{searchTerm ? 'Try a different search term or' : 'Start by'} adding a new health record to track your vital metrics.</p>
              <button onClick={() => setShowAddModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
                <Plus className={styles.iconSm} />
                Add Your First Record
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Record Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{editingRecord ? 'Edit Health Record' : 'Add New Health Record'}</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.iconButton}>
                <X size={24}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Record Type *</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                >
                  <option value="">Select record type</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Heart Rate">Heart Rate</option>
                  <option value="Blood Sugar">Blood Sugar</option>
                  <option value="Weight">Weight</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Cholesterol">Cholesterol</option>
                  <option value="BMI">BMI</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Value *</label>
                  <input
                    type="text"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="e.g., 120/80"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Unit *</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="e.g., mmHg"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                    className={styles.formInput}
                  >
                    <option value="normal">Normal</option>
                    <option value="elevated">Elevated</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="Additional notes about this record..."
                  rows="3"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={`${styles.btn} ${styles.btnSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HealthRecords;
