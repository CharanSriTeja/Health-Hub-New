import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Heart, Activity, Thermometer, Weight, Plus, Search, 
  Download, Share2, Edit, Trash2, TrendingUp, TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './HealthRecords.module.css';

const HealthRecords = () => {
  const { isDarkMode } = useTheme();
  
  const [healthRecords, setHealthRecords] = useState([
    { id: 1, type: 'Blood Pressure', value: '120/80', unit: 'mmHg', date: '2025-08-15', status: 'normal', trend: 'stable', notes: 'Regular checkup - within normal range' },
    { id: 2, type: 'Heart Rate', value: '72', unit: 'bpm', date: '2025-08-15', status: 'normal', trend: 'stable', notes: 'Resting heart rate - good' },
    { id: 3, type: 'Blood Sugar', value: '130', unit: 'mg/dL', date: '2025-08-10', status: 'elevated', trend: 'stable', notes: 'Post-meal glucose, slightly high.' },
    { id: 4, type: 'Weight', value: '70', unit: 'kg', date: '2025-08-08', status: 'normal', trend: 'decreasing', notes: 'Lost 2kg this month - good progress' },
    { id: 5, type: 'Temperature', value: '98.6', unit: '°F', date: '2025-08-05', status: 'normal', trend: 'stable', notes: 'Normal body temperature' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
              <button className={`${styles.btn} ${styles.btnSecondary}`}><Download className={styles.iconSm}/>Export All</button>
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
              <div key={record.id} className={styles.tableRow}>
                <div className={`${styles.tableCell} ${styles.cellType}`}>
                  {getTypeIcon(record.type)}
                  <span>{record.type}</span>
                </div>
                <div className={`${styles.tableCell} ${styles.cellDate}`} data-label="Date">{record.date}</div>
                <div className={`${styles.tableCell} ${styles.cellValue}`} data-label="Value">
                    {record.value} <span>{record.unit}</span>
                </div>
                <div className={styles.tableCell} data-label="Status">
                  <span className={`${styles.statusBadge} ${styles[record.status]}`}>{record.status}</span>
                </div>
                <div className={`${styles.tableCell} ${styles.cellActions}`}>
                  <button className={styles.iconButton} title="Edit"><Edit className={styles.iconSm}/></button>
                  <button className={styles.iconButton} title="Share"><Share2 className={styles.iconSm}/></button>
                  <button className={styles.iconButton} title="Delete"><Trash2 className={styles.iconSm}/></button>
                </div>
              </div>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className={styles.emptyState}>
              <Activity className={styles.emptyIcon}/>
              <h3>No Records Found</h3>
              <p>Try a different search term or add a new record.</p>
            </div>
          )}
        </motion.div>
      </div>
      {/* Add Record Modal would go here */}
    </div>
  );
};

export default HealthRecords;
