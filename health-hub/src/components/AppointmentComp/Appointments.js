import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import { 
  Calendar as CalendarIcon, Clock, MapPin, User, Plus,
  Edit, Trash2, X, ArrowLeft, Star
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './Appointments.module.css';
// Ensure your global.css (with calendar styles) is imported in App.js or index.js

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', hospital: 'City General Hospital', date: '2025-08-20', time: '10:00 AM', status: 'upcoming' },
    { id: 2, doctor: 'Dr. Michael Chen', specialty: 'Dermatology', hospital: 'Metro Medical Center', date: '2025-08-10', time: '2:30 PM', status: 'completed' },
    { id: 4, doctor: 'Dr. Robert Wilson', specialty: 'Cardiology', hospital: 'City General Hospital', date: '2025-08-20', time: '11:30 AM', status: 'upcoming' }
  ]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [bookingForm, setBookingForm] = useState({ doctor: '', specialty: '', date: '', time: '', notes: '' });

  // ... (rest of your component logic remains the same)

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month' && getAppointmentsForDate(date).length > 0) {
      // This class is GLOBAL from global.css
      return <div className="appointment-dot"></div>;
    }
    return null;
  };
  
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
          <div className={styles.headerRight}>
            <button onClick={() => setShowBookingModal(true)} className={`${styles.btn} ${styles.btnPrimary}`}>
              <Plus size={16} /> Book New
            </button>
          </div>
        </div>
      </header>

      <main className={`${styles.container} ${styles.pageContent}`}>
        <div className={styles.appointmentsLayout}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className={styles.card}>
              <h2>Your Calendar</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                className="custom-calendar" // This class is GLOBAL
              />
              <div className={styles.calendarLegend}>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.dotUpcoming}`}></span>Upcoming</div>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.dotCompleted}`}></span>Completed</div>
                <div className={styles.legendItem}><span className={`${styles.dot} ${styles.dotCancelled}`}></span>Cancelled</div>
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
                    <motion.div key={appointment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.appointmentItem}>
                      <div className={styles.appointmentMain}>
                        <span className={`${styles.statusHighlight} ${styles[appointment.status]}`}></span>
                        <div className={styles.appointmentInfo}>
                          <h3>{appointment.doctor}</h3>
                          <p><User size={14} />{appointment.specialty}</p>
                          <p><MapPin size={14} />{appointment.hospital}</p>
                          <p><Clock size={14} />{appointment.time}</p>
                        </div>
                      </div>
                      <div className={styles.appointmentActions}>
                        {appointment.status === 'upcoming' && (
                          <>
                            <button className={`${styles.iconButton} ${styles.editBtn}`}><Edit size={18} /></button>
                            <button className={`${styles.iconButton} ${styles.cancelBtn}`}><Trash2 size={18} /></button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <button className={`${styles.iconButton} ${styles.rateBtn}`}><Star size={18} /></button>
                        )}
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
      </main>

      {/* The Modal would ideally be its own component with its own CSS module */}
    </div>
  );
};

export default Appointments;