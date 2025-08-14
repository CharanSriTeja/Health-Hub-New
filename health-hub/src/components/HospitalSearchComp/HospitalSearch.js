import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Star, CheckCircle, X, SlidersHorizontal, Navigation, 
  Phone, ExternalLink, Heart, Calendar, User, Clock, ArrowLeft, 
  Users, Award, Building
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { hospitalAPI, doctorAPI, appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

import styles from './HospitalSearch.module.css';

const HospitalSearch = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  // State management
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [showFilters, setShowFilters] = useState(false);
  const [likedHospitals, setLikedHospitals] = useState([]);
  
  // Doctor and appointment booking states
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // View states
  const [currentView, setCurrentView] = useState('hospitals'); // hospitals, doctors, booking

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        toast.success('Location accessed successfully!');
        fetchHospitals(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        let errorMessage = 'Unable to access location. Showing all hospitals.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
        
        toast.error(errorMessage);
        fetchHospitals();
        setLoading(false);
      },
      options
    );
  };

  // Fetch hospitals
  const fetchHospitals = async (lat = null, lng = null) => {
    try {
      setLoading(true);
      const params = {};
      
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.radius = 50; // 50km radius
      }
      
      if (searchTerm) params.city = searchTerm;
      if (selectedSpecialty !== 'All Specialties') params.specialty = selectedSpecialty;
      if (selectedDistrict !== 'All Districts') params.state = selectedDistrict;
      
      const response = await hospitalAPI.getAllHospitals(params);
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors for a hospital
  const fetchDoctors = async (hospitalId) => {
    try {
      const response = await doctorAPI.getDoctorsByHospital(hospitalId);
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
    }
  };

  // Fetch available slots for a doctor
  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const response = await doctorAPI.getAvailableSlots(doctorId, { date });
      setAvailableSlots(response.data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch available slots');
    }
  };

  // Handle hospital selection
  const handleHospitalSelect = async (hospital) => {
    setSelectedHospital(hospital);
    await fetchDoctors(hospital._id);
    setCurrentView('doctors');
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView('booking');
  };

  // Handle date selection
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      await fetchAvailableSlots(selectedDoctor._id, date);
    }
  };

  // Book appointment
  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      setBookingLoading(true);
      const appointmentData = {
        doctor: selectedDoctor._id,
        hospital: selectedHospital._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        department: selectedDoctor.specialization,
        appointmentType: 'consultation',
        reason: 'General consultation',
        notes: `Appointment with ${selectedDoctor.name} at ${selectedHospital.name}`
      };

      await appointmentAPI.createAppointment(appointmentData);
      toast.success('Appointment booked successfully!');
      
      // Reset and go back to hospitals view
      setCurrentView('hospitals');
      setSelectedHospital(null);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setAvailableSlots([]);
      
      // Navigate to appointments page
      navigate('/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  // Filter hospitals
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         hospital.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address?.state?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || 
                            hospital.departments?.some(dept => dept.name === selectedSpecialty);
    const matchesDistrict = selectedDistrict === 'All Districts' || 
                           hospital.address?.state === selectedDistrict;
    return matchesSearch && matchesSpecialty && matchesDistrict;
  });

  // Toggle liked hospital
  const toggleLiked = (hospitalId) => {
    setLikedHospitals(prev => 
      prev.includes(hospitalId) 
        ? prev.filter(id => id !== hospitalId) 
        : [...prev, hospitalId]
    );
    toast.success('Your preferences have been updated!');
  };

  // Open Google Maps
  const openGoogleMaps = (coordinates) => {
    window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
  };

  // Get districts and specialties from hospitals
  const districts = ['All Districts', ...new Set(hospitals.map(h => h.address?.state).filter(Boolean))];
  const specialties = ['All Specialties', ...new Set(hospitals.flatMap(h => h.departments?.map(d => d.name) || []))];

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (searchTerm || selectedSpecialty !== 'All Specialties' || selectedDistrict !== 'All Districts') {
      fetchHospitals(userLocation?.lat, userLocation?.lng);
    }
  }, [searchTerm, selectedSpecialty, selectedDistrict]);

  // Render hospitals view
  const renderHospitalsView = () => (
    <>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.searchFilterSection}>
        <div className={styles.searchBarWrapper}>
          <Search className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by hospital name, city, or district..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className={styles.searchInput} 
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`${styles.btn} ${styles.filterToggleBtn}`}>
          <SlidersHorizontal /><span>Filters</span>
        </button>
        {!userLocation && (
                          <button onClick={getUserLocation} className={`${styles.btn} ${styles.locationBtn}`}>
                  <MapPin size={16} /> Get Location
                </button>
        )}
      </motion.div>
      
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={styles.filterPanel}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>District</label>
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className={styles.formSelect}>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Specialty</label>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className={styles.formSelect}>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading hospitals...</p>
        </div>
      ) : (
        <div className={styles.hospitalsGrid}>
          {filteredHospitals.map((hospital, index) => (
            <motion.div 
              key={hospital._id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }} 
              className={styles.hospitalCard}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <h3>{hospital.name}</h3>
                  <p><MapPin size={14}/>{hospital.address?.city}, {hospital.address?.state}</p>
                  {hospital.distance && (
                    <p className={styles.distance}>{hospital.distance} km away</p>
                  )}
                </div>
                <button onClick={() => toggleLiked(hospital._id)} className={`${styles.likeButton} ${likedHospitals.includes(hospital._id) ? styles.liked : ''}`}>
                  <Heart size={16} />
                </button>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.rating}>
                    <Star className={styles.iconXs}/>
                    {hospital.ratings?.overall || 0} ({hospital.ratings?.totalReviews || 0} reviews)
                  </span>
                  <span className={`${styles.availability} ${styles.available}`}>
                    <CheckCircle size={14}/>
                    Available
                  </span>
                </div>
                <p className={styles.description}>{hospital.description || 'A trusted healthcare facility providing quality medical services.'}</p>
                <div className={styles.facilities}>
                  <h4>Departments:</h4>
                  <div className={styles.tagList}>
                    {hospital.departments?.slice(0, 4).map(dept => (
                      <span key={dept.name} className={styles.tag}>{dept.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.contactLinks}>
                  {hospital.coordinates && (
                    <button onClick={() => openGoogleMaps(hospital.coordinates)}>
                      <Navigation size={14}/>Directions
                    </button>
                  )}
                  {hospital.contact?.phone && (
                    <a href={`tel:${hospital.contact.phone}`}>
                      <Phone size={14}/>Call
                    </a>
                  )}
                  {hospital.contact?.website && (
                    <a href={hospital.contact.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14}/>Website
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => handleHospitalSelect(hospital)} 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  <Users size={16}/>View Doctors
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredHospitals.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <Building className={styles.emptyIcon}/>
          <h3>No Hospitals Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </>
  );

  // Render doctors view
  const renderDoctorsView = () => (
    <>
      <div className={styles.viewHeader}>
        <button onClick={() => setCurrentView('hospitals')} className={styles.backButton}>
          <ArrowLeft size={16} /> Back to Hospitals
        </button>
        <h2>Doctors at {selectedHospital?.name}</h2>
      </div>
      
      <div className={styles.doctorsGrid}>
        {doctors.map((doctor, index) => (
          <motion.div 
            key={doctor._id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.05 }} 
            className={styles.doctorCard}
          >
            <div className={styles.doctorHeader}>
              <div className={styles.doctorInfo}>
                <h3>{doctor.name}</h3>
                <p className={styles.specialization}>{doctor.specialization}</p>
                <p className={styles.experience}>{doctor.experience} years experience</p>
              </div>
              <div className={styles.doctorRating}>
                <Star size={16} />
                <span>{doctor.rating?.average || 0}</span>
              </div>
            </div>
            <div className={styles.doctorBody}>
              <p className={styles.consultationFee}>₹{doctor.consultationFee} consultation fee</p>
              {doctor.bio && <p className={styles.bio}>{doctor.bio}</p>}
            </div>
            <div className={styles.doctorFooter}>
              <button 
                onClick={() => handleDoctorSelect(doctor)} 
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                <Calendar size={16}/> Book Appointment
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {doctors.length === 0 && (
        <div className={styles.emptyState}>
          <User className={styles.emptyIcon}/>
          <h3>No Doctors Found</h3>
          <p>No doctors are currently available at this hospital.</p>
        </div>
      )}
    </>
  );

  // Render booking view
  const renderBookingView = () => (
    <>
      <div className={styles.viewHeader}>
        <button onClick={() => setCurrentView('doctors')} className={styles.backButton}>
          <ArrowLeft size={16} /> Back to Doctors
        </button>
        <h2>Book Appointment</h2>
      </div>
      
      <div className={styles.bookingContainer}>
        <div className={styles.bookingInfo}>
          <h3>Appointment Details</h3>
          <div className={styles.infoRow}>
            <span><Building size={16} /> Hospital:</span>
            <span>{selectedHospital?.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span><User size={16} /> Doctor:</span>
            <span>{selectedDoctor?.name} ({selectedDoctor?.specialization})</span>
          </div>
          <div className={styles.infoRow}>
            <span><Award size={16} /> Fee:</span>
            <span>₹{selectedDoctor?.consultationFee}</span>
          </div>
        </div>
        
        <div className={styles.bookingForm}>
          <div className={styles.formGroup}>
            <label>Select Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => handleDateSelect(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={styles.formInput}
            />
          </div>
          
          {selectedDate && availableSlots.length > 0 && (
            <div className={styles.formGroup}>
              <label>Select Time</label>
              <div className={styles.timeSlots}>
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTime(slot)}
                    className={`${styles.timeSlot} ${selectedTime === slot ? styles.selected : ''}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedDate && availableSlots.length === 0 && (
            <p className={styles.noSlots}>No available slots for this date. Please select another date.</p>
          )}
          
          {selectedTime && (
            <button 
              onClick={handleBookAppointment}
              disabled={bookingLoading}
              className={`${styles.btn} ${styles.btnPrimary} ${styles.bookButton}`}
            >
              {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.hospitalsPage}>
      <header className={styles.pageHeader}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/dashboard')} className={styles.iconButton}>
              <X />
            </button>
            <div className={styles.logo}>
              <div className={styles.logoIconWrapper}>
                <MapPin color="white"/>
              </div>
              <span className={styles.logoText}>
                {currentView === 'hospitals' ? 'Find Hospitals' : 
                 currentView === 'doctors' ? 'Select Doctor' : 'Book Appointment'}
              </span>
            </div>
          </div>
          <button onClick={toggleTheme} className={styles.iconButton}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className={`${styles.container} ${styles.pageContent}`}>
        {currentView === 'hospitals' && renderHospitalsView()}
        {currentView === 'doctors' && renderDoctorsView()}
        {currentView === 'booking' && renderBookingView()}
      </main>
    </div>
  );
};

export default HospitalSearch;
