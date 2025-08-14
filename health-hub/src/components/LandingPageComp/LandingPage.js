import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Shield, Smartphone, Users, FileText, Calendar,
  CheckCircle, ArrowRight, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext'; // Ensure path is correct, e.g., ../../contexts/ThemeContext

// Import the scoped CSS module for this component
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

  const features = [
    { icon: <Heart className={styles.icon} />, title: "Personal Health Records", description: "Access your complete medical history, lab reports, and prescriptions in one secure location." },
    { icon: <Calendar className={styles.icon} />, title: "Smart Appointment Booking", description: "Book appointments with nearby hospitals and doctors based on availability and specializations." },
    { icon: <Shield className={styles.icon} />, title: "Secure & Private", description: "Your health data is protected with bank-level security and HIPAA compliance standards." },
    { icon: <Smartphone className={styles.icon} />, title: "24/7 Access", description: "Manage your health anytime, anywhere with our mobile-responsive platform." },
    { icon: <Users className={styles.icon} />, title: "Doctor Communication", description: "Secure messaging with healthcare providers for consultations and follow-ups." },
    { icon: <FileText className={styles.icon} />, title: "Lab Reports & Prescriptions", description: "Upload, view, and share your medical documents with healthcare providers." }
  ];
  const benefits = [ "Real-time hospital availability", "Location-based hospital search", "Specialty-wise doctor filtering", "Appointment history tracking", "Prescription management", "Google Maps integration" ];

  return (
    <div className={styles.landingPage} data-theme={isDarkMode ? 'dark' : 'light'}>
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className={styles.stickyHeader}>
        <nav className={`${styles.container} ${styles.headerNav}`}>
          <div className={styles.logo}>
            <div className={styles.logoIconWrapper}><Heart className={styles.icon} /></div>
            <span className={styles.logoText}>HealthHub</span>
          </div>
          <motion.button onClick={toggleTheme} className={styles.themeToggleButton} whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        </nav>
      </motion.header>

      <main>
        <section className={styles.heroSection}>
          <div className={styles.heroBg}></div>
          <div className={`${styles.container} ${styles.heroContent}`}>
            <motion.h1 variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2, type: 'spring' }}>
              Your Health, <span className={styles.textGradientAnimated}>Your Control</span>
            </motion.h1>
            <motion.p variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4, type: 'spring' }}>
              A secure, comprehensive patient portal that puts your health information at your fingertips. Manage appointments, access medical records, and connect with healthcare providers seamlessly.
            </motion.p>
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
              <button onClick={() => navigate('/auth')} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
                Get Started Today <ArrowRight className={styles.iconSm} />
              </button>
            </motion.div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>A Healthier You is a Click Away</h2>
              <p>Our platform provides all the tools you need to take control of your health journey.</p>
            </div>
            <motion.div className={styles.featuresGrid} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants} className={`${styles.card} ${styles.featureCard}`}>
                  <div className={styles.featureCardHeader}>
                    <div className={styles.featureIconWrapper}>{feature.icon}</div>
                    <h3>{feature.title}</h3>
                  </div>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className={styles.benefitsSection}>
          <div className={`${styles.container} ${styles.benefitsGrid}`}>
            <motion.div className={styles.benefitsContent} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2>Why Choose HealthHub?</h2>
              <p>Experience healthcare management like never before with our innovative features designed for modern patients.</p>
              <motion.ul className={styles.benefitsList} variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                {benefits.map((benefit, index) => (
                  <motion.li key={index} variants={itemVariants} className={styles.benefitItem}><CheckCircle className={styles.benefitIcon} /><span>{benefit}</span></motion.li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div className={styles.benefitVisual} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <img src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Doctor and patient" />
            </motion.div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2>Ready to Take Control?</h2>
              <p>Join thousands of patients who are managing their health more effectively with HealthHub.</p>
              <button onClick={() => navigate('/auth')} className={`${styles.btn} ${styles.btnLight} ${styles.btnLg}`}>
                Start Your Journey Now <ArrowRight className={styles.iconSm} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} HealthHub. All Rights Reserved.</p>
          <p className={styles.footerSubtitle}>Built with love for a healthier future.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
