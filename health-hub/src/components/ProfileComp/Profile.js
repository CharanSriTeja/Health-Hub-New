import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X,
  Camera, Shield, Bell, Settings, LogOut, Heart, Activity, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './Profile.module.css';

// Mock Contexts (assuming these are defined elsewhere)
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>;
};
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ name: 'Alex Doe', email: 'alex.doe@example.com', phone: '123-456-7890', location: 'San Francisco, CA', dateOfBirth: '1990-05-15', emergencyContact: '098-765-4321' });
  const updateUser = (newUserData) => setUser({ ...user, ...newUserData });
  const logout = () => {};
  return <AuthContext.Provider value={{ user, updateUser, logout }}>{children}</AuthContext.Provider>;
};

// --- Main Profile Component ---
const ProfileComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });

  const handleSave = () => { updateUser(editForm); setIsEditing(false); toast.success('Profile updated successfully!'); };
  const handleCancel = () => { setEditForm({ ...user }); setIsEditing(false); };
  const handleLogout = () => { logout(); toast.success('Logged out successfully!'); };
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
                    <img src={`https://i.pravatar.cc/150?u=${user.email}`} alt="Profile" className={styles.avatar} />
                    <button className={styles.avatarEditButton}><Camera size={18} /></button>
                  </div>
                  <div><h3>{user?.name}</h3><p className={styles.userEmail}>{user?.email}</p></div>
                </div>
                <div className={styles.infoGrid}>
                  <InfoField label="Full Name" value={user?.name} icon={User} isEditing={isEditing} editValue={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                  <InfoField label="Email Address" value={user?.email} icon={Mail} isEditing={isEditing} editValue={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" />
                  <InfoField label="Phone Number" value={user?.phone} icon={Phone} isEditing={isEditing} editValue={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} type="tel" />
                  <InfoField label="Location" value={user?.location} icon={MapPin} isEditing={isEditing} editValue={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                  <InfoField label="Date of Birth" value={formatDate(user?.dateOfBirth)} icon={Calendar} isEditing={isEditing} editValue={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} type="date" />
                  <InfoField label="Emergency Contact" value={user?.emergencyContact} icon={Shield} isEditing={isEditing} editValue={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} type="tel" />
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
const InfoField = ({ label, value, icon: Icon, isEditing, editValue, onChange, type = 'text' }) => (
  <div className={styles.infoField}>
    <label className={styles.fieldLabel}>{label}</label>
    {isEditing ? (<input type={type} value={editValue} onChange={onChange} className={styles.fieldInput} />) : (<div className={styles.fieldDisplay}><Icon size={18} className={styles.fieldIcon} /><span>{value || 'Not provided'}</span></div>)}
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

export default function Profile() {
  return (<ThemeProvider><AuthProvider><ProfileComponent /></AuthProvider></ThemeProvider>);
}
