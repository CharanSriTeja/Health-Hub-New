import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Star, CheckCircle, X, SlidersHorizontal, Navigation, Phone, ExternalLink, Heart, Calendar
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Import the scoped CSS module for this component
import styles from './HospitalSearch.module.css';

const HospitalSearch = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Mock data
  const [hospitals] = useState([
    { "id": 1, "name": "King George Hospital (KGH)", "specialty": "Multi-Specialty", "state": "Andhra Pradesh", "city": "Visakhapatnam", "district": "Visakhapatnam", "address": "Maharanipeta, Visakhapatnam", "rating": 4.5, "reviews": 2150, "availability": "available", "phone": "+91 891 2562244", "website": "http://kghvizag.org", "coordinates": {"lat": 17.6999, "lng": 83.3050}, "description": "A major tertiary care government hospital, renowned for a wide range of medical services.", "facilities": ["Emergency Care", "ICU", "Trauma Center", "Blood Bank", "Radiology", "Pharmacy"] },
    { "id": 2, "name": "Andhra Medical College", "specialty": "Multi-Specialty", "state": "Andhra Pradesh", "city": "Visakhapatnam", "district": "Visakhapatnam", "address": "Panjab University Rd", "rating": 4.6, "reviews": 1890, "availability": "available", "phone": "+91 891 2561152", "website": "http://amc.edu.in", "coordinates": {"lat": 17.7289, "lng": 83.3185}, "description": "Premier medical institution known for quality education and patient care.", "facilities": ["Emergency Care", "ICU", "Laboratory", "Pharmacy"] }
    // ... all 20 hospitals
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [showFilters, setShowFilters] = useState(false);
  const [likedHospitals, setLikedHospitals] = useState([]);
  
  const districts = ['All Districts', ...new Set(hospitals.map(h => h.district))];
  const specialties = ['All Specialties', ...new Set(hospitals.map(h => h.specialty))];

  // ... (rest of your component logic remains the same)
  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) || hospital.city.toLowerCase().includes(searchTerm.toLowerCase()) || hospital.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || hospital.specialty === selectedSpecialty;
    const matchesDistrict = selectedDistrict === 'All Districts' || hospital.district === selectedDistrict;
    return matchesSearch && matchesSpecialty && matchesDistrict;
  });
  const toggleLiked = (hospitalId) => { setLikedHospitals(prev => prev.includes(hospitalId) ? prev.filter(id => id !== hospitalId) : [...prev, hospitalId]); toast.success('Your preferences have been updated!'); };
  const openGoogleMaps = (coordinates) => { window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank'); };
  const handleBookAppointment = (hospital) => { navigate('/appointments', { state: { selectedHospital: hospital } }); };
  
  return (
    <div className={styles.hospitalsPage}>
      <header className={styles.pageHeader}>
        <div className={`${styles.container} ${styles.headerContent}`}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate('/dashboard')} className={styles.iconButton}><X /></button>
            <div className={styles.logo}>
              <div className={styles.logoIconWrapper}><MapPin color="white"/></div>
              <span className={styles.logoText}>Find Hospitals</span>
            </div>
          </div>
          <button onClick={toggleTheme} className={styles.iconButton}>{isDarkMode ? '☀️' : '🌙'}</button>
        </div>
      </header>

      <main className={`${styles.container} ${styles.pageContent}`}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.searchFilterSection}>
          <div className={styles.searchBarWrapper}>
            <Search className={styles.searchIcon} />
            <input type="text" placeholder="Search by hospital name, city, or district..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`${styles.btn} ${styles.filterToggleBtn}`}>
            <SlidersHorizontal /><span>Filters</span>
          </button>
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

        <div className={styles.hospitalsGrid}>
          {filteredHospitals.map((hospital, index) => (
            <motion.div key={hospital.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={styles.hospitalCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <h3>{hospital.name}</h3>
                  <p><MapPin size={14}/>{hospital.city}, {hospital.district}</p>
                </div>
                <button onClick={() => toggleLiked(hospital.id)} className={`${styles.likeButton} ${likedHospitals.includes(hospital.id) ? styles.liked : ''}`}>
                  <Heart size={16} />
                </button>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}>
                  <span className={styles.rating}><Star className={styles.iconXs}/>{hospital.rating} ({hospital.reviews} reviews)</span>
                  <span className={`${styles.availability} ${styles[hospital.availability]}`}>
                    {hospital.availability === 'available' ? <CheckCircle size={14}/> : <X size={14}/>}
                    {hospital.availability === 'available' ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className={styles.description}>{hospital.description}</p>
                <div className={styles.facilities}>
                  <h4>Facilities:</h4>
                  <div className={styles.tagList}>
                    {hospital.facilities.slice(0, 4).map(f => <span key={f} className={styles.tag}>{f}</span>)}
                  </div>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.contactLinks}>
                  <button onClick={() => openGoogleMaps(hospital.coordinates)}><Navigation size={14}/>Directions</button>
                  <a href={`tel:${hospital.phone}`}><Phone size={14}/>Call</a>
                  <a href={hospital.website} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/>Website</a>
                </div>
                <button onClick={() => handleBookAppointment(hospital)} disabled={hospital.availability === 'unavailable'} className={`${styles.btn} ${styles.btnPrimary}`}>
                  <Calendar size={16}/>Book
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className={styles.emptyState}>
            <Search className={styles.emptyIcon}/>
            <h3>No Hospitals Found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalSearch;
