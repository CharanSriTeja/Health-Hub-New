import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, Calendar, User, Plus, Search,
  Download, Share2, Trash2, Eye, X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { prescriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './Prescriptions.module.css';

const Prescriptions = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // --- STATE AND DATA ---
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    date: '',
    hospital: '',
    instructions: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    status: 'active'
  });

  // Fetch prescriptions from API
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionAPI.getAllPrescriptions({ 
        search: searchTerm,
        status: activeTab === 'all' ? undefined : activeTab
      });
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [searchTerm, activeTab]);

  // ... (Component logic remains the same)
  useEffect(() => { 
    const handleKeyDown = (event) => { 
      if (event.key === 'Escape') { 
        setSelectedPrescription(null); 
        setShowAddModal(false); 
      } 
    }; 
    window.addEventListener('keydown', handleKeyDown); 
    return () => window.removeEventListener('keydown', handleKeyDown); 
  }, []);

  const filteredPrescriptions = prescriptions.filter(p => 
    (p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.medications.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))) && 
    (activeTab === 'all' || p.status === activeTab)
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle medication changes
  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // Add new medication
  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  // Remove medication
  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter out empty medications
      const cleanMedications = formData.medications.filter(med => 
        med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
      );

      if (cleanMedications.length === 0) {
        toast.error('Please add at least one medication');
        return;
      }

      const prescriptionData = {
        ...formData,
        medications: cleanMedications
      };

      await prescriptionAPI.createPrescription(prescriptionData);
      toast.success('Prescription added successfully');
      setShowAddModal(false);
      setFormData({
        doctorName: '',
        specialty: '',
        date: '',
        hospital: '',
        instructions: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        status: 'active'
      });
      fetchPrescriptions();
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to save prescription');
    }
  };

  const handleShare = (prescription) => { 
    const text = `Prescription from ${prescription.doctorName} on ${new Date(prescription.date).toLocaleDateString()}`; 
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`; 
    window.open(whatsappUrl, '_blank'); 
    toast.success('Sharing prescription...'); 
  };

  const handleDelete = async (id) => { 
    if (window.confirm('Are you sure you want to delete this prescription?')) { 
      try {
        await prescriptionAPI.deletePrescription(id);
        setPrescriptions(prescriptions.filter(p => p._id !== id)); 
        setSelectedPrescription(null); 
        toast.success('Prescription deleted!'); 
      } catch (error) {
        console.error('Error deleting prescription:', error);
        toast.error('Failed to delete prescription');
      }
    } 
  };

  if (loading) {
    return (
      <div className={styles.prescriptionsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading prescriptions...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.prescriptionsPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className={styles.container}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.pageHeader}>
          <div>
            <h1>Your Prescriptions</h1>
            <p className={styles.subtitle}>Manage and track your medication history.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
            <Plus className={styles.iconSm} /><span>Add New</span>
          </button>
        </motion.div>

        <div className={styles.toolbar}>
          <div className={styles.searchBarWrapper}>
            <Search className={styles.searchIcon} />
            <input type="text" placeholder="Search by doctor or medication..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
          </div>
          <div className={styles.tabs}>
            {['all', 'active', 'completed', 'expired'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.prescriptionsGrid}>
          {filteredPrescriptions.map(p => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout className={`${styles.card} ${styles.prescriptionCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.doctorInfo}>
                  <User className={styles.icon} />
                  <div><h4>{p.doctorName}</h4><p>{p.specialty}</p></div>
                </div>
                <span className={`${styles.statusBadge} ${styles[p.status]}`}>{p.status}</span>
              </div>
              <div className={styles.cardBody}>
                <h5>Medications</h5>
                <ul className={styles.medicationList}>
                  {p.medications.map((med, index) => (
                    <li key={index}><Pill className={styles.iconSm} /><div><strong>{med.name}</strong><span>{med.dosage} &bull; {med.frequency}</span></div></li>
                  ))}
                </ul>
              </div>
              <div className={styles.cardFooter}>
                <p><Calendar className={styles.iconSm} /> Issued: {new Date(p.date).toLocaleDateString()}</p>
                <button onClick={() => setSelectedPrescription(p)} className={`${styles.btn} ${styles.btnSecondary}`}>
                  <Eye className={styles.iconSm} /> View
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className={styles.emptyState}>
            <Pill className={styles.emptyIcon} />
            <h3>No Prescriptions Found</h3>
            <p>{searchTerm || activeTab !== 'all' ? 'Try adjusting your search or filter.' : 'Start by adding your first prescription to track your medications.'}</p>
            {!searchTerm && activeTab === 'all' && (
              <button onClick={() => setShowAddModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
                <Plus className={styles.iconSm} />
                Add Your First Prescription
              </button>
            )}
          </div>
        )}
      </div>

      {selectedPrescription && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPrescription(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className={styles.iconButton}><X size={24}/></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Doctor:</strong> {selectedPrescription.doctorName}
              </div>
              <div className={styles.detailRow}>
                <strong>Specialty:</strong> {selectedPrescription.specialty}
              </div>
              <div className={styles.detailRow}>
                <strong>Hospital:</strong> {selectedPrescription.hospital}
              </div>
              <div className={styles.detailRow}>
                <strong>Date:</strong> {new Date(selectedPrescription.date).toLocaleDateString()}
              </div>
              <div className={styles.detailRow}>
                <strong>Status:</strong> 
                <span className={`${styles.statusBadge} ${styles[selectedPrescription.status]}`}>
                  {selectedPrescription.status}
                </span>
              </div>
              <div className={styles.detailSection}>
                <h4>Medications:</h4>
                <ul className={styles.medicationList}>
                  {selectedPrescription.medications.map((med, index) => (
                    <li key={index}>
                      <Pill className={styles.iconSm} />
                      <div>
                        <strong>{med.name}</strong>
                        <span>{med.dosage} &bull; {med.frequency} &bull; {med.duration}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedPrescription.instructions && (
                <div className={styles.detailSection}>
                  <h4>Instructions:</h4>
                  <p>{selectedPrescription.instructions}</p>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => handleShare(selectedPrescription)} className={`${styles.btn} ${styles.btnSecondary}`}>
                <Share2 className={styles.iconSm} /> Share
              </button>
              <button onClick={() => handleDelete(selectedPrescription._id)} className={`${styles.btn} ${styles.btnDanger}`}>
                <Trash2 className={styles.iconSm} /> Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add New Prescription Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add New Prescription</h2>
              <button onClick={() => setShowAddModal(false)} className={styles.iconButton}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Doctor Name *</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Specialty *</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                    placeholder="Cardiology"
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
                  <label>Hospital</label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Hospital Name"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.formInput}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="Special instructions for taking medications..."
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.medicationHeader}>
                  <label>Medications *</label>
                  <button type="button" onClick={addMedication} className={`${styles.btn} ${styles.btnSmall}`}>
                    <Plus className={styles.iconSm} /> Add Medication
                  </button>
                </div>
                {formData.medications.map((med, index) => (
                  <div key={index} className={styles.medicationForm}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          placeholder="Medication name"
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="Dosage"
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          placeholder="Frequency (e.g., Once daily)"
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          placeholder="Duration (e.g., 30 days)"
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>
                    {formData.medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className={`${styles.btn} ${styles.btnSmall} ${styles.btnDanger}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className={`${styles.btn} ${styles.btnSecondary}`}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Add Prescription
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
