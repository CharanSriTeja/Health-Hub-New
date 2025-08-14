import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Download, Share2, Eye, Trash2, Plus, ArrowLeft,
  Calendar, User, AlertCircle, CheckCircle, X, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { labReportAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './LabReports.module.css';

const LabReports = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadForm, setUploadForm] = useState({ 
    title: '', 
    type: '', 
    labName: '', 
    doctorName: '', 
    notes: '', 
    file: null 
  });

  // Fetch lab reports from API
  const fetchLabReports = async () => {
    try {
      setLoading(true);
      const response = await labReportAPI.getAllLabReports({ 
        status: activeFilter === 'All' ? undefined : activeFilter.toLowerCase()
      });
      setReports(response.data.labReports || []);
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      toast.error('Failed to fetch lab reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabReports();
  }, [activeFilter]);

  // Component logic
  const getStatusPill = (status) => {
    switch (status) {
      case 'normal': return { icon: <CheckCircle className={styles.icon} />, className: styles.statusPillNormal };
      case 'abnormal': return { icon: <AlertCircle className={styles.icon} />, className: styles.statusPillAbnormal };
      case 'pending': return { icon: <Clock className={styles.icon} />, className: styles.statusPillPending };
      default: return { icon: <FileText className={styles.icon} />, className: '' };
    }
  };

  const filteredReports = useMemo(() => 
    activeFilter === 'All' ? reports : reports.filter(r => r.status === activeFilter.toLowerCase()), 
    [reports, activeFilter]
  );

  // Handle file upload
  const handleFileUpload = useCallback((file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid file type (JPEG, PNG, GIF, PDF, DOC, DOCX)');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
      toast.success('File selected successfully');
    }
  }, []);

  // Handle upload form submission
  const handleUploadSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!uploadForm.title || !uploadForm.type || !uploadForm.labName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      formData.append('labName', uploadForm.labName);
      formData.append('doctorName', uploadForm.doctorName);
      formData.append('notes', uploadForm.notes);
      formData.append('reportFile', uploadForm.file);

      await labReportAPI.createLabReport(formData);
      toast.success('Lab report uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({ 
        title: '', 
        type: '', 
        labName: '', 
        doctorName: '', 
        notes: '', 
        file: null 
      });
      fetchLabReports();
    } catch (error) {
      console.error('Error uploading lab report:', error);
      toast.error('Failed to upload lab report');
    }
  }, [uploadForm]);

  // Handle download
  const handleDownload = async (report) => {
    try {
      const response = await labReportAPI.downloadLabReport(report._id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileName || 'lab-report';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  // Handle view report
  const handleViewReport = async (report) => {
    try {
      const response = await labReportAPI.viewLabReport(report._id);
      // For now, we'll just show the report details
      // In a real app, you might want to open the file in a new tab or modal
      setViewingReport(report);
    } catch (error) {
      console.error('Error viewing report:', error);
      toast.error('Failed to view report');
    }
  };

  // Handle share report
  const handleShareWhatsApp = (report) => {
    const text = `Lab Report: ${report.title} from ${report.labName} on ${new Date(report.date).toLocaleDateString()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Sharing report...');
  };

  // Handle delete report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this lab report?')) {
      return;
    }

    try {
      await labReportAPI.deleteLabReport(reportId);
      setReports(reports.filter(r => r._id !== reportId));
      setViewingReport(null);
      toast.success('Lab report deleted successfully');
    } catch (error) {
      console.error('Error deleting lab report:', error);
      toast.error('Failed to delete lab report');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    const files = e.dataTransfer.files; 
    if (files && files.length > 0) handleFileUpload(files[0]); 
  };

  const reportTypes = ['Blood Analysis', 'Cardiology', 'Radiology', 'Laboratory', 'Pathology', 'Microbiology'];
  
  const statCards = useMemo(() => [
    { label: 'Total Reports', value: reports.length, icon: <FileText />, color: 'Blue' },
    { label: 'Normal', value: reports.filter(r => r.status === 'normal').length, icon: <CheckCircle />, color: 'Green' },
    { label: 'Abnormal', value: reports.filter(r => r.status === 'abnormal').length, icon: <AlertCircle />, color: 'Red' },
    { label: 'Pending', value: reports.filter(r => r.status === 'pending').length, icon: <Clock />, color: 'Yellow' }
  ], [reports]);

  if (loading) {
    return (
      <div className={styles.labReportsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading lab reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.labReportsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <header className={styles.pageHeader}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/dashboard')} className={styles.iconBtn}><ArrowLeft size={20} /></button>
            <div className={styles.headerTitle}>
              <div className={styles.headerIconWrapper}><FileText size={24} className={styles.textWhite} /></div>
              <h1>Lab Reports</h1>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button onClick={() => setShowUploadModal(true)} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnUploadDesktop}`}>
              <Plus size={16} /> Upload Report
            </button>
            <button onClick={() => setShowUploadModal(true)} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnUploadMobile}`}>
              <Plus size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className={`${styles.container} ${styles.pageMain}`}>
        {/* Stats Section - Only show if user has reports */}
        {reports.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.statsGrid}>
            {statCards.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={`${styles.statIcon} ${styles['icon' + stat.color]}`}>{stat.icon}</div>
                <div className={styles.statInfo}>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={styles.reportsCard}>
          <div className={styles.reportsHeader}>
            <h2 className={styles.reportsTitle}>All Reports</h2>
            <div className={styles.filterGroup}>
              {['All', 'Normal', 'Abnormal', 'Pending'].map(filter => (
                <button key={filter} onClick={() => setActiveFilter(filter)} className={`${styles.filterBtn} ${activeFilter === filter ? styles.filterBtnActive : ''}`}>
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.reportsList}>
            <AnimatePresence>
              {filteredReports.map((report) => {
                const statusPill = getStatusPill(report.status);
                return (
                  <motion.div key={report._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={styles.reportItem}>
                    <div className={styles.reportItemMain}>
                      <div className={styles.reportItemHeader}>
                        <h3>{report.title}</h3>
                        <span className={`${styles.statusPill} ${statusPill.className}`}>
                          {statusPill.icon} {report.status}
                        </span>
                      </div>
                      <div className={styles.reportItemDetails}>
                        <div><FileText size={14} /><span>{report.type}</span></div>
                        <div><Calendar size={14} /><span>{new Date(report.date).toLocaleDateString()}</span></div>
                        <div className={styles.detailDoctor}><User size={14} /><span>{report.doctorName || 'N/A'}</span></div>
                      </div>
                    </div>
                    <div className={styles.reportItemActions}>
                      <button onClick={() => handleViewReport(report)} className={styles.iconBtn} title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleDownload(report)} className={styles.iconBtn} title="Download">
                        <Download size={18} />
                      </button>
                      <button onClick={() => handleShareWhatsApp(report)} className={styles.iconBtn} title="Share">
                        <Share2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteReport(report._id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {filteredReports.length === 0 && (
              <div className={styles.noReportsPlaceholder}>
                <FileText size={64} />
                <h3>No Lab Reports Found</h3>
                <p>
                  {activeFilter !== 'All' 
                    ? `There are no reports matching the "${activeFilter}" filter.` 
                    : 'Start by uploading your first lab report to keep track of your medical tests.'
                  }
                </p>
                {activeFilter === 'All' && (
                  <button onClick={() => setShowUploadModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
                    <Plus size={16} /> Upload Your First Report
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* View Report Modal */}
      {viewingReport && (
        <div className={styles.modalOverlay} onClick={() => setViewingReport(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Lab Report Details</h2>
              <button onClick={() => setViewingReport(null)} className={styles.iconButton}><X size={24}/></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Title:</strong> {viewingReport.title}
              </div>
              <div className={styles.detailRow}>
                <strong>Type:</strong> {viewingReport.type}
              </div>
              <div className={styles.detailRow}>
                <strong>Lab:</strong> {viewingReport.labName}
              </div>
              <div className={styles.detailRow}>
                <strong>Doctor:</strong> {viewingReport.doctorName || 'N/A'}
              </div>
              <div className={styles.detailRow}>
                <strong>Date:</strong> {new Date(viewingReport.date).toLocaleDateString()}
              </div>
              <div className={styles.detailRow}>
                <strong>Status:</strong> 
                <span className={`${styles.statusPill} ${getStatusPill(viewingReport.status).className}`}>
                  {getStatusPill(viewingReport.status).icon} {viewingReport.status}
                </span>
              </div>
              {viewingReport.notes && (
                <div className={styles.detailSection}>
                  <h4>Notes:</h4>
                  <p>{viewingReport.notes}</p>
                </div>
              )}
              {viewingReport.fileName && (
                <div className={styles.detailSection}>
                  <h4>File:</h4>
                  <p>{viewingReport.fileName}</p>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => handleDownload(viewingReport)} className={`${styles.btn} ${styles.btnSecondary}`}>
                <Download size={16} /> Download
              </button>
              <button onClick={() => handleShareWhatsApp(viewingReport)} className={`${styles.btn} ${styles.btnSecondary}`}>
                <Share2 size={16} /> Share
              </button>
              <button onClick={() => handleDeleteReport(viewingReport._id)} className={`${styles.btn} ${styles.btnDanger}`}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Upload Lab Report</h2>
              <button onClick={() => setShowUploadModal(false)} className={styles.iconButton}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Report Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className={styles.formInput}
                  placeholder="e.g., Blood Test Report"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Report Type *</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                    required
                    className={styles.formInput}
                  >
                    <option value="">Select type</option>
                    {reportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Lab Name *</label>
                  <input
                    type="text"
                    value={uploadForm.labName}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, labName: e.target.value }))}
                    required
                    className={styles.formInput}
                    placeholder="e.g., City Lab"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Doctor Name</label>
                <input
                  type="text"
                  value={uploadForm.doctorName}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, doctorName: e.target.value }))}
                  className={styles.formInput}
                  placeholder="e.g., Dr. John Doe"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                  className={styles.formTextarea}
                  placeholder="Additional notes about the report..."
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Upload File *</label>
                <div 
                  className={`${styles.fileUploadArea} ${isDragging ? styles.dragging : ''} ${uploadForm.file ? styles.hasFile : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                    className={styles.fileInput}
                  />
                  <Upload size={24} />
                  <p>
                    {uploadForm.file 
                      ? `Selected: ${uploadForm.file.name}` 
                      : 'Drag and drop a file here, or click to select'
                    }
                  </p>
                  <span>Supported formats: JPEG, PNG, GIF, PDF, DOC, DOCX (Max 10MB)</span>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowUploadModal(false)} className={`${styles.btn} ${styles.btnSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Upload Report
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LabReports;
