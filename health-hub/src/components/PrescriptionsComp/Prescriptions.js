import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, Calendar, User, Plus, Search,
  Download, Share2, Trash2, Eye, X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './Prescriptions.module.css';
import { useTheme } from '../../contexts/ThemeContext';

const Prescriptions = () => {
  const { isDarkMode } = useTheme();
  
  // --- STATE AND DATA ---
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, doctorName: 'Dr. Sarah Johnson', specialty: 'Cardiology', date: '2025-08-15', medications: [ { name: 'Aspirin', dosage: '100mg', frequency: 'Once daily', duration: '30 days' }, { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days' } ], instructions: 'Take with food. Avoid alcohol.', status: 'active', hospital: 'City General Hospital' },
    { id: 2, doctorName: 'Dr. Michael Chen', specialty: 'Dermatology', date: '2025-07-20', medications: [ { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days' } ], instructions: 'Take at night. May cause drowsiness.', status: 'completed', hospital: 'Skin Care Clinic' },
    { id: 3, doctorName: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', date: '2025-06-01', medications: [ { name: 'Amoxicillin', dosage: '250mg', frequency: 'Three times daily', duration: '10 days' } ], instructions: 'Complete full course.', status: 'expired', hospital: 'Childrens Medical Center' }
  ]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // ... (Component logic remains the same)
  useEffect(() => { const handleKeyDown = (event) => { if (event.key === 'Escape') { setSelectedPrescription(null); setShowAddModal(false); } }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, []);
  const filteredPrescriptions = prescriptions.filter(p => (p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) || p.medications.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))) && (activeTab === 'all' || p.status === activeTab));
  const handleShare = (prescription) => { const text = `Prescription from ${prescription.doctorName} on ${new Date(prescription.date).toLocaleDateString()}`; const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`; window.open(whatsappUrl, '_blank'); toast.success('Sharing prescription...'); };
  const handleDelete = (id) => { if (window.confirm('Are you sure you want to delete this prescription?')) { setPrescriptions(prescriptions.filter(p => p.id !== id)); setSelectedPrescription(null); toast.success('Prescription deleted!'); } };
  
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
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} layout className={`${styles.card} ${styles.prescriptionCard}`}>
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
            <Pill className={styles.emptyIcon} /><h3>No Prescriptions Found</h3><p>Try adjusting your search or filter.</p>
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
              <div className={styles.detailSection}><h4>Doctor Information</h4><div className={styles.infoBox}><p><strong>{selectedPrescription.doctorName}</strong>, {selectedPrescription.specialty}</p><p>{selectedPrescription.hospital}</p><p>Issued on: {new Date(selectedPrescription.date).toLocaleDateString()}</p></div></div>
              <div className={styles.detailSection}><h4>Medications</h4><ul className={`${styles.medicationList} ${styles.modalMedList}`}>{selectedPrescription.medications.map((med, index) => (<li key={index}><Pill className={styles.iconSm}/><div><strong>{med.name}</strong><span>{med.dosage} &bull; {med.frequency} &bull; {med.duration}</span></div></li>))}</ul></div>
              <div className={styles.detailSection}><h4>Instructions</h4><div className={styles.infoBox}><p>{selectedPrescription.instructions || 'No specific instructions provided.'}</p></div></div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => handleDelete(selectedPrescription.id)} className={`${styles.btn} ${styles.btnDanger}`}><Trash2 className={styles.iconSm}/>Delete</button>
              <div style={{display: 'flex', gap: '10px'}}>
                <button className={`${styles.btn} ${styles.btnSecondary}`}><Download className={styles.iconSm}/>Download</button>
                <button onClick={() => handleShare(selectedPrescription)} className={`${styles.btn} ${styles.btnPrimary}`}><Share2 className={styles.iconSm}/>Share</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add New Prescription Modal would be handled similarly */}
    </div>
  );
};

export default Prescriptions;
