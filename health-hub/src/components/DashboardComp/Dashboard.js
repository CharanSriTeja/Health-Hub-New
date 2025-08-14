import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Calendar, MapPin, FileText, Pill, User, LogOut, Bell,
  Menu, X, Clock, CheckCircle, AlertCircle, TrendingUp, Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Mock data
  const stats = { totalAppointments: 12, upcomingAppointments: 3, totalPrescriptions: 8 };
  const recentAppointments = [{ id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', hospital: 'City General Hospital', date: '2025-08-20', time: '10:00 AM', status: 'upcoming' }, { id: 2, doctor: 'Dr. Michael Chen', specialty: 'Dermatology', hospital: 'Metro Medical Center', date: '2025-08-10', time: '2:30 PM', status: 'completed' }];
  const quickActions = [{ title: 'Book Appointment', icon: <Calendar />, route: '/appointments' }, { title: 'View Records', icon: <FileText />, route: '/health-records' }, { title: 'Prescriptions', icon: <Pill />, route: '/prescriptions' }, { title: 'Lab Reports', icon: <Activity />, route: '/lab-reports' }];

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); navigate('/'); };
  const getStatusIcon = (status) => {
    if (status === 'upcoming') return <Clock size={20} />;
    if (status === 'completed') return <CheckCircle size={20} />;
    return <AlertCircle size={20} />;
  };

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Overview', icon: <TrendingUp />, route: '/dashboard' },
    { id: 'appointments', label: 'Appointments', icon: <Calendar />, route: '/appointments' },
    { id: 'hospitals', label: 'Find Hospitals', icon: <MapPin />, route: '/hospitals' },
    { id: 'records', label: 'Health Records', icon: <FileText />, route: '/health-records' },
    { id: 'prescriptions', label: 'Prescriptions', icon: <Pill />, route: '/prescriptions' },
    { id: 'profile', label: 'Profile', icon: <User />, route: '/profile' }
  ];

  return (
    <div className={styles.dashboardLayout}>
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.isOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIconWrapper}><Heart color="white" /></div>
            <span className={styles.logoText}>HealthHub</span>
          </div>
          <button className={styles.mobileCloseBtn} onClick={() => setIsMobileMenuOpen(false)}><X /></button>
        </div>
        <nav className={styles.sidebarNav}>
          {sidebarNavItems.map((item) => (
            <button key={item.id} onClick={() => { navigate(item.route); setIsMobileMenuOpen(false); }}
              className={`${styles.sidebarNavItem} ${location.pathname.startsWith(item.route) ? styles.active : ''}`}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.sidebarNavItem}><LogOut /><span>Logout</span></button>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.dashboardHeader}>
          <button className={styles.mobileMenuToggle} onClick={() => setIsMobileMenuOpen(true)}><Menu /></button>
          <div className={styles.headerActions}>
            <button className={styles.themeToggle} onClick={toggleTheme}>{isDarkMode ? '☀️' : '🌙'}</button>
            <button className={styles.notificationBtn}><Bell /><span className={styles.notificationDot}></span></button>
            <div className={styles.profileMenu}>
              <button className={styles.profileToggle} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <img src={`https://i.pravatar.cc/150?u=${user?.email}`} alt="User avatar" className={styles.avatar} />
                <span className={styles.userName}>{user?.firstName || 'User'}</span>
              </button>
              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <a href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); setIsProfileOpen(false); }}>Profile</a>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1>Welcome back, {user?.firstName}!</h1>
            <p className={styles.subtitle}>Here's what's happening with your health today.</p>
          </motion.div>

          <motion.div className={styles.statsGrid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className={styles.statCard}>
              <div className={styles.statCardText}><p>Total Appointments</p><span>{stats.totalAppointments}</span></div>
              <div className={`${styles.statCardIcon} ${styles.iconBgBlue}`}><Calendar /></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statCardText}><p>Upcoming</p><span>{stats.upcomingAppointments}</span></div>
              <div className={`${styles.statCardIcon} ${styles.iconBgOrange}`}><Clock /></div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statCardText}><p>Prescriptions</p><span>{stats.totalPrescriptions}</span></div>
              <div className={`${styles.statCardIcon} ${styles.iconBgPurple}`}><Pill /></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2>Quick Actions</h2>
            <div className={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <motion.button key={action.title} onClick={() => navigate(action.route)} className={styles.actionCard} whileHover={{ y: -5 }}>
                  <div className={styles.actionCardIcon}>{action.icon}</div>
                  <h3>{action.title}</h3>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className={styles.sectionTitle}>
              <h2>Recent Appointments</h2>
              <a href="/appointments" onClick={(e) => { e.preventDefault(); navigate('/appointments'); }}>View All</a>
            </div>
            <div className={styles.appointmentsList}>
              {recentAppointments.map((appt) => (
                <div key={appt.id} className={`${styles.card} ${styles.appointmentCard}`}>
                  <div className={styles.appointmentDetails}>
                    <div className={`${styles.statusIcon} ${styles[appt.status]}`}>{getStatusIcon(appt.status)}</div>
                    <div>
                      <h3>{appt.doctor}</h3>
                      <p>{appt.specialty} • {appt.hospital}</p>
                      <p className={styles.appointmentTime}>{new Date(appt.date).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})} at {appt.time}</p>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[appt.status]}`}>{appt.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
      {isMobileMenuOpen && <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)}/>}
    </div>
  );
};

export default Dashboard;
