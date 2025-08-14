import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X,
  Camera, Shield, Bell, Settings, LogOut, Heart, Activity, FileText,
  Droplets, Users, AlertTriangle, Pill, Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// Import the scoped CSS module for this component
import styles from './Profile.module.css';

// --- Main Profile Component ---
const ProfileComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ 
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    },
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      relationship: user?.emergencyContact?.relationship || '',
      phoneNumber: user?.emergencyContact?.phoneNumber || ''
    },
    medicalHistory: {
      allergies: user?.medicalHistory?.allergies || [],
      chronicConditions: user?.medicalHistory?.chronicConditions || [],
      medications: user?.medicalHistory?.medications || [],
      surgeries: user?.medicalHistory?.surgeries || []
    }
  });

  const handleSave = async () => { 
    try {
      // Format the data for the backend
      const updateData = {
        ...editForm,
        dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString() : null,
        // Ensure nested objects are properly structured
        address: {
          street: editForm.address.street || '',
          city: editForm.address.city || '',
          state: editForm.address.state || '',
          zipCode: editForm.address.zipCode || '',
          country: editForm.address.country || ''
        },
        emergencyContact: {
          name: editForm.emergencyContact.name || '',
          relationship: editForm.emergencyContact.relationship || '',
          phoneNumber: editForm.emergencyContact.phoneNumber || ''
        }
      };

      const result = await updateUser(updateData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };
  const handleCancel = () => { 
    setEditForm({ 
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
      bloodGroup: user?.bloodGroup || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || ''
      },
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        relationship: user?.emergencyContact?.relationship || '',
        phoneNumber: user?.emergencyContact?.phoneNumber || ''
      },
      medicalHistory: {
        allergies: user?.medicalHistory?.allergies || [],
        chronicConditions: user?.medicalHistory?.chronicConditions || [],
        medications: user?.medicalHistory?.medications || [],
        surgeries: user?.medicalHistory?.surgeries || []
      }
    }); 
    setIsEditing(false); 
  };
  const handleLogout = () => { logout(); };
  const stats = [ { label: 'Appointments', value: '12', icon: Calendar, color: 'blue' }, { label: 'Prescriptions', value: '8', icon: FileText, color: 'green' }, { label: 'Lab Reports', value: '15', icon: Activity, color: 'purple' }, { label: 'Health Records', value: '24', icon: Heart, color: 'red' } ];
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={styles.profilePage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className={styles.profileContainer}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.profileHeader}>
            <h1>Profile & Settings</h1>
            <p>Manage your account details and preferences.</p>
          </div>

          <div className={styles.profileGrid}>
            <div className={styles.profileMainColumn}>
              <motion.div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Personal Information</h2>
                  {!isEditing && <motion.button whileHover={{ scale: 1.05 }} onClick={() => setIsEditing(true)} className={`${styles.btn} ${styles.btnPrimary}`}><Edit size={16} /> Edit</motion.button>}
                </div>
                                 <div className={styles.userInfoHeader}>
                   <div className={styles.avatarWrapper}>
                     <div className={styles.avatar}>
                       {user?.firstName && user?.lastName ? (
                         <span className={styles.avatarText}>
                           {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
                         </span>
                       ) : (
                         <span className={styles.avatarText}>
                           {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                         </span>
                       )}
                     </div>
                     <button className={styles.avatarEditButton}><Camera size={18} /></button>
                   </div>
                   <div><h3>{user?.firstName} {user?.lastName}</h3><p className={styles.userEmail}>{user?.email}</p></div>
                 </div>
                                 <div className={styles.infoGrid}>
                   {/* Basic Information */}
                   <InfoField label="First Name" value={user?.firstName} icon={User} isEditing={isEditing} editValue={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
                   <InfoField label="Last Name" value={user?.lastName} icon={User} isEditing={isEditing} editValue={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
                   <InfoField label="Email Address" value={user?.email} icon={Mail} isEditing={isEditing} editValue={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" />
                   <InfoField label="Phone Number" value={user?.phoneNumber} icon={Phone} isEditing={isEditing} editValue={editForm.phoneNumber} onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })} type="tel" />
                   <InfoField label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'} icon={Calendar} isEditing={isEditing} editValue={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} type="date" />
                   <InfoField label="Gender" value={user?.gender || 'Not provided'} icon={Users} isEditing={isEditing} editValue={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} type="select" options={['male', 'female', 'other']} />
                   <InfoField label="Blood Group" value={user?.bloodGroup || 'Not provided'} icon={Droplets} isEditing={isEditing} editValue={editForm.bloodGroup} onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })} type="select" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
                   
                   {/* Address Information */}
                   <InfoField label="Street Address" value={user?.address?.street || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.street} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, street: e.target.value } })} />
                   <InfoField label="City" value={user?.address?.city || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.city} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, city: e.target.value } })} />
                   <InfoField label="State" value={user?.address?.state || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.state} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, state: e.target.value } })} />
                   <InfoField label="Zip Code" value={user?.address?.zipCode || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.zipCode} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, zipCode: e.target.value } })} />
                   <InfoField label="Country" value={user?.address?.country || 'Not provided'} icon={MapPin} isEditing={isEditing} editValue={editForm.address?.country} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, country: e.target.value } })} />
                   
                   {/* Emergency Contact */}
                   <InfoField label="Emergency Contact Name" value={user?.emergencyContact?.name || 'Not provided'} icon={Users} isEditing={isEditing} editValue={editForm.emergencyContact?.name} onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, name: e.target.value } })} />
                   <InfoField label="Emergency Contact Relationship" value={user?.emergencyContact?.relationship || 'Not provided'} icon={Users} isEditing={isEditing} editValue={editForm.emergencyContact?.relationship} onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, relationship: e.target.value } })} />
                   <InfoField label="Emergency Contact Phone" value={user?.emergencyContact?.phoneNumber || 'Not provided'} icon={Phone} isEditing={isEditing} editValue={editForm.emergencyContact?.phoneNumber} onChange={(e) => setEditForm({ ...editForm, emergencyContact: { ...editForm.emergencyContact, phoneNumber: e.target.value } })} type="tel" />
                 </div>

                 {/* Medical History Section */}
                 <div className={styles.sectionDivider}>
                   <h3>Medical History</h3>
                 </div>
                 <div className={styles.infoGrid}>
                   <div className={styles.infoField}>
                     <label className={styles.fieldLabel}>Allergies</label>
                     {isEditing ? (
                       <textarea 
                         value={editForm.medicalHistory.allergies.join(', ')} 
                         onChange={(e) => setEditForm({ 
                           ...editForm, 
                           medicalHistory: { 
                             ...editForm.medicalHistory, 
                             allergies: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                           } 
                         })} 
                         className={styles.fieldInput}
                         placeholder="Enter allergies separated by commas"
                       />
                     ) : (
                       <div className={styles.fieldDisplay}>
                         <AlertTriangle size={18} className={styles.fieldIcon} />
                         <span>{user?.medicalHistory?.allergies?.length > 0 ? user.medicalHistory.allergies.join(', ') : 'No allergies recorded'}</span>
                       </div>
                     )}
                   </div>
                   
                   <div className={styles.infoField}>
                     <label className={styles.fieldLabel}>Chronic Conditions</label>
                     {isEditing ? (
                       <textarea 
                         value={editForm.medicalHistory.chronicConditions.join(', ')} 
                         onChange={(e) => setEditForm({ 
                           ...editForm, 
                           medicalHistory: { 
                             ...editForm.medicalHistory, 
                             chronicConditions: e.target.value.split(',').map(item => item.trim()).filter(item => item) 
                           } 
                         })} 
                         className={styles.fieldInput}
                         placeholder="Enter chronic conditions separated by commas"
                       />
                     ) : (
                       <div className={styles.fieldDisplay}>
                         <Stethoscope size={18} className={styles.fieldIcon} />
                         <span>{user?.medicalHistory?.chronicConditions?.length > 0 ? user.medicalHistory.chronicConditions.join(', ') : 'No chronic conditions recorded'}</span>
                       </div>
                     )}
                   </div>
                 </div>
                {isEditing && (
                  <div className={styles.formActions}>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleSave} className={`${styles.btn} ${styles.btnSuccess}`}><Save size={16} /> Save Changes</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleCancel} className={`${styles.btn} ${styles.btnSecondary}`}><X size={16} /> Cancel</motion.button>
                  </div>
                )}
              </motion.div>
              <div className={styles.statsGrid}>
                {stats.map((stat) => (
                  <motion.div key={stat.label} whileHover={{ y: -5, scale: 1.03 }} className={`${styles.statCard} ${styles[`statCard--${stat.color}`]}`}>
                    <div className={styles.statIconWrapper}><stat.icon className={styles.statIcon} /></div>
                    <div><p className={styles.statValue}>{stat.value}</p><p className={styles.statLabel}>{stat.label}</p></div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className={styles.profileSidebar}>
              <SettingsCard title="Appearance">
                <div className={styles.themeToggle}><span className={styles.themeToggleLabel}>Dark Mode</span>
                  <button onClick={toggleTheme} className={`${styles.switch} ${isDarkMode ? styles.active : ''}`}><motion.span layout className={styles.switchHandle} /></button>
                </div>
              </SettingsCard>
              <SettingsCard title="Quick Actions">
                <QuickActionButton icon={Shield}>Privacy Settings</QuickActionButton>
                <QuickActionButton icon={Bell}>Notification Preferences</QuickActionButton>
              </SettingsCard>
              <SettingsCard title="Account">
                <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} className={`${styles.quickActionBtn} ${styles.logoutBtn}`}><LogOut size={20} /> Logout</motion.button>
              </SettingsCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Components updated to use styles object
const InfoField = ({ label, value, icon: Icon, isEditing, editValue, onChange, type = 'text', options = [] }) => (
  <div className={styles.infoField}>
    <label className={styles.fieldLabel}>{label}</label>
    {isEditing ? (
      type === 'select' ? (
        <select value={editValue} onChange={onChange} className={styles.fieldInput}>
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input type={type} value={editValue} onChange={onChange} className={styles.fieldInput} />
      )
    ) : (
      <div className={styles.fieldDisplay}>
        <Icon size={18} className={styles.fieldIcon} />
        <span>{value || 'Not provided'}</span>
      </div>
    )}
  </div>
);
const SettingsCard = ({ title, children }) => (
  <motion.div whileHover={{ y: -2 }} className={`${styles.card} ${styles['card--sidebar']}`}>
    <h3 className={styles.sidebarCardTitle}>{title}</h3>{children}
  </motion.div>
);
const QuickActionButton = ({ icon: Icon, children }) => (
  <motion.button whileHover={{ scale: 1.02, x: 2 }} className={styles.quickActionBtn}>
    <Icon size={20} /><span>{children}</span>
  </motion.button>
);

export default ProfileComponent;
