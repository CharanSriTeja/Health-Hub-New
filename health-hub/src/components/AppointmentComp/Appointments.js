import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { 
  Calendar as CalendarIcon, Clock, MapPin, User, Plus,
  Edit, Trash2, X, ArrowLeft, Star, FileText, Building
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

import styles from './Appointments.module.css';

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAllAppointments();
      const appointmentsData = response.data.appointments || [];
      setAppointments(appointmentsData);
      
      // Calculate stats
      const now = new Date();
      const upcoming = appointmentsData.filter(apt => 
        new Date(apt.appointmentDate) > now && apt.status !== 'cancelled'
      ).length;
      const completed = appointmentsData.filter(apt => 
        apt.status === 'completed'
      ).length;
      const cancelled = appointmentsData.filter(apt => 
        apt.status === 'cancelled'
      ).length;
      
      setStats({
        total: appointmentsData.length,
        upcoming,
        completed,
        cancelled
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentAPI.deleteAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  // Edit appointment
  const handleEditAppointment = (appointment) => {
    // Navigate to hospital search to book a new appointment
    navigate('/hospitals');
  };

  // Rate appointment
  const handleRateAppointment = (appointment) => {
    toast.info('Rating feature coming soon!');
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  // Calendar tile content
  const tileContent = ({ date, view }) => {
    if (view === 'month' && getAppointmentsForDate(date).length > 0) {
      return <div className="appointment-dot"></div>;
    }
    return null;
  };

  // Format appointment time
  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'scheduled': '#3b82f6',
      'confirmed': '#10b981',
      'in-progress': '#f59e0b',
      'completed': '#10b981',
      'cancelled': '#ef4444',
      'no-show': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Get status text
  const getStatusText = (status) => {
    const statusMap = {
      'scheduled': 'Scheduled',
      'confirmed': 'Confirmed',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'no-show': 'No Show'
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <div className={`${styles.container} ${styles.headerContent}`}>
            <div className={styles.headerLeft}>
              <button onClick={() => navigate('/dashboard')} className={styles.iconButton}>
                <ArrowLeft />
              </button>
              <div className={styles.logo}>
                <div className={styles.logoIconWrapper}><CalendarIcon color="white" /></div>
                <span className={styles.logoText}>Appointments</span>
              </div>
            </div>
            <button onClick={toggleTheme} className={styles.iconButton}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>
        <main className={`${styles.container} ${styles.pageContent}`}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading appointments...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/dashboard')} className={styles.iconButton}>
              <ArrowLeft />
            </button>
            <div className={styles.logo}>
              <div className={styles.logoIconWrapper}><CalendarIcon color="white" /></div>
              <span className={styles.logoText}>Appointments</span>
            </div>
          </div>
          <button onClick={toggleTheme} className={styles.iconButton}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className={`${styles.container} ${styles.pageContent}`}>
        {/* Stats Section - Only show if user has appointments */}
        {stats.total > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.statsSection}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CalendarIcon size={20} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.total}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Clock size={20} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.upcoming}</h3>
                  <p>Upcoming</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FileText size={20} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.completed}</h3>
                  <p>Completed</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <X size={20} />
                </div>
                <div className={styles.statContent}>
                  <h3>{stats.cancelled}</h3>
                  <p>Cancelled</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className={styles.appointmentsLayout}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.card}>
              <h2>Your Calendar</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="custom-calendar"
              />
              <div className={styles.calendarLegend}>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotUpcoming}`}></span>Upcoming
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotCompleted}`}></span>Completed
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.dot} ${styles.dotCancelled}`}></span>Cancelled
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.card}>
              <div className={styles.listHeader}>
                <h2>Appointments for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              </div>
              <div className={styles.appointmentsList}>
                {getAppointmentsForDate(selectedDate).length > 0 ? (
                  getAppointmentsForDate(selectedDate).map((appointment) => (
                    <motion.div key={appointment._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.appointmentItem}>
                      <div className={styles.appointmentMain}>
                        <span 
                          className={styles.statusHighlight} 
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        ></span>
                        <div className={styles.appointmentInfo}>
                          <h3>{appointment.doctor?.name || 'Doctor Name'}</h3>
                          <p><User size={14} />{appointment.department}</p>
                          <p><Building size={14} />{appointment.hospital?.name || 'Hospital Name'}</p>
                          <p><Clock size={14} />{formatTime(appointment.appointmentTime)}</p>
                          <p className={styles.statusText} style={{ color: getStatusColor(appointment.status) }}>
                            {getStatusText(appointment.status)}
                          </p>
                        </div>
                      </div>
                      <div className={styles.appointmentActions}>
                        {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                          <>
                            <button 
                              onClick={() => handleEditAppointment(appointment)} 
                              className={`${styles.iconButton} ${styles.editBtn}`}
                              title="Reschedule"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteAppointment(appointment._id)} 
                              className={`${styles.iconButton} ${styles.cancelBtn}`}
                              title="Cancel Appointment"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : appointment.status === 'completed' ? (
                          <button 
                            onClick={() => handleRateAppointment(appointment)} 
                            className={`${styles.iconButton} ${styles.rateBtn}`}
                            title="Rate Appointment"
                          >
                            <Star size={18} />
                          </button>
                        ) : null}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <CalendarIcon className={styles.emptyIcon} />
                    <p>No appointments for this date.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Empty state for new users */}
        {appointments.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.emptyStateContainer}>
            <div className={styles.emptyStateCard}>
              <CalendarIcon className={styles.emptyIcon} />
              <h3>No Appointments Yet</h3>
              <p>You haven't booked any appointments yet. Start by finding a hospital and doctor.</p>
              <button 
                onClick={() => navigate('/hospitals')} 
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                <Plus size={16} /> Find Hospitals
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Appointments;