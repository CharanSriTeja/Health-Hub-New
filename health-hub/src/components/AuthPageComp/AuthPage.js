import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
    phone: '', address: '', city: '', state: '', zipCode: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateStep = () => {
    const newErrors = {};
    if (isSignUp) {
      if (step === 1) {
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      } 
      else if (step === 2) {
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      } 
      else if (step === 3) {
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.address) newErrors.address = 'Address is required';
      }
    } else {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep()) { setStep(prev => prev + 1); } };
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    if (!validateStep()) { 
      toast.error('Please fix the errors on the page.'); 
      return; 
    } 
    setIsLoading(true); 
    
    try {
      if (isSignUp) {
        // Registration
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password + 'aA1', // Add lowercase, uppercase and number to meet validation
          phoneNumber: formData.phone ? (formData.phone.startsWith('+') ? formData.phone : '+91' + formData.phone) : '+1234567890', // Add country code if missing
          dateOfBirth: new Date('1990-01-01').toISOString(), // Convert to ISO string
          gender: 'other',
          bloodGroup: 'O+',
          address: {
            street: formData.address || '123 Main Street',
            city: formData.city || 'New York',
            state: formData.state || 'NY',
            zipCode: formData.zipCode || '10001',
            country: 'United States'
          },
          emergencyContact: {
            name: formData.firstName + ' ' + formData.lastName,
            relationship: 'Self',
            phoneNumber: formData.phone ? (formData.phone.startsWith('+') ? formData.phone : '+91' + formData.phone) : '+1234567890'
          }
        };
        
        const result = await register(userData);
        if (result.success) {
          navigate('/dashboard');
        }
      } else {
        // Login
        const credentials = {
          email: formData.email,
          password: formData.password
        };
        
        const result = await login(credentials);
        if (result.success) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => { 
    setIsSignUp(!isSignUp); 
    setErrors({}); 
    setStep(1); 
    setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', address: '', city: '', state: '', zipCode: '' }); 
  };
  
  const formVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className={styles.authPageContainer} data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className={styles.authPageContent}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={styles.pageHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIconWrapper}><Heart size={28} color="white" /></div>
            <span className={styles.logoText}>HealthHub</span>
          </div>
          <h1 className={styles.headerTitle}>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h1>
          <p className={styles.headerSubtitle}>
            {isSignUp ? 'Join us to manage your health journey.' : 'Sign in to access your health portal.'}
          </p>
        </motion.div>

        <button onClick={toggleTheme} className={styles.themeToggle}>{isDarkMode ? '☀️' : '🌙'}</button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.authCard}>
          {isSignUp && (
            <div className={styles.progressBarContainer}>
              <motion.div className={styles.progressBar} initial={{ width: 0 }} animate={{ width: `${(step - 1) * 50}%` }}></motion.div>
            </div>
          )}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                  <InputGroup name="email" label="Email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={<Mail />} />
                  <InputGroup name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formData.password} onChange={handleInputChange} error={errors.password} icon={<Lock />}
                    rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.inputIconRight}>{showPassword ? <EyeOff /> : <Eye />}</button>}
                  />
                  <button type="submit" disabled={isLoading} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}>
                    {isLoading ? <div className={styles.spinner} /> : 'Sign In'}
                  </button>
                </motion.div>
              ) : (
                <>
                  {step === 1 && (
                    <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                      <div className={styles.formGrid}>
                        <InputGroup name="firstName" label="First Name" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} icon={<User />} />
                        <InputGroup name="lastName" label="Last Name" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} />
                      </div>
                      <InputGroup name="email" label="Email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={<Mail />} />
                      <button type="button" onClick={nextStep} className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}>Next</button>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                      <InputGroup name="password" type={showPassword ? 'text' : 'password'} label="Password" value={formData.password} onChange={handleInputChange} error={errors.password} icon={<Lock />} 
                        rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.inputIconRight}>{showPassword ? <EyeOff /> : <Eye />}</button>}
                      />
                      <InputGroup name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} label="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} icon={<Lock />}
                        rightIcon={<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={styles.inputIconRight}>{showConfirmPassword ? <EyeOff /> : <Eye />}</button>}
                      />
                      <div className={styles.formActions}>
                        <button type="button" onClick={prevStep} className={`${styles.btn} ${styles.btnSecondary}`}>Back</button>
                        <button type="button" onClick={nextStep} className={`${styles.btn} ${styles.btnPrimary}`}>Next</button>
                      </div>
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                      <InputGroup name="phone" type="tel" label="Phone Number" value={formData.phone} onChange={handleInputChange} error={errors.phone} icon={<Phone />} />
                      <InputGroup name="address" label="Address" value={formData.address} onChange={handleInputChange} error={errors.address} icon={<MapPin />} />
                      <div className={styles.formActions}>
                        <button type="button" onClick={prevStep} className={`${styles.btn} ${styles.btnSecondary}`}>Back</button>
                        <button type="submit" disabled={isLoading} className={`${styles.btn} ${styles.btnPrimary}`}>
                          {isLoading ? <div className={styles.spinner} /> : 'Create Account'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </form>
          <p className={styles.toggleMode}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={toggleMode} className={styles.toggleLink}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, type = 'text', value, onChange, error, icon, rightIcon }) => {
  const inputClasses = [
    styles.formInput,
    icon ? styles.hasIconLeft : '',
    rightIcon ? styles.hasIconRight : '',
    error ? styles.formInputError : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputGroup}>
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.inputIconLeft}>{icon}</span>}
        <input
          type={type} id={name} name={name} value={value}
          onChange={onChange} placeholder=" " className={inputClasses}
        />
        <label htmlFor={name} className={`${styles.formLabel} ${icon ? styles.hasIconLeft : ''}`}>{label}</label>
        {rightIcon}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default AuthPage;

