import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Calendar, 
  Pill, 
  FileText, 
  Activity, 
  User, 
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const TourGuide = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const tourSteps = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Welcome to your Patient Health Portal! This is your main dashboard where you can see an overview of your health data, recent appointments, and quick access to all features.',
      icon: <Activity className="w-8 h-8" />,
      path: '/dashboard',
      features: ['Health Statistics', 'Recent Appointments', 'Quick Actions', 'Notifications']
    },
    {
      id: 'hospitals',
      title: 'Hospital Search & Booking',
      description: 'Find and book appointments with nearby hospitals and specialists. Filter by specialty, location, and availability.',
      icon: <Building2 className="w-8 h-8" />,
      path: '/hospitals',
      features: ['Search Hospitals', 'Filter by Specialty', 'Check Availability', 'Book Appointments', 'Get Directions']
    },
    {
      id: 'appointments',
      title: 'Appointment Management',
      description: 'Manage all your appointments in one place. View your calendar, book new appointments, and track your medical visits.',
      icon: <Calendar className="w-8 h-8" />,
      path: '/appointments',
      features: ['Calendar View', 'Book Appointments', 'Cancel/Reschedule', 'Appointment History', 'Reminders']
    },
    {
      id: 'prescriptions',
      title: 'Prescription Management',
      description: 'Keep track of all your medications and prescriptions. View dosage instructions, refill reminders, and share with healthcare providers.',
      icon: <Pill className="w-8 h-8" />,
      path: '/prescriptions',
      features: ['View Prescriptions', 'Medication Instructions', 'Refill Reminders', 'Share with Doctors', 'Download PDFs']
    },
    {
      id: 'lab-reports',
      title: 'Lab Reports & Results',
      description: 'Access and manage your laboratory test results. Upload new reports, view historical data, and share with healthcare providers.',
      icon: <FileText className="w-8 h-8" />,
      path: '/lab-reports',
      features: ['Upload Reports', 'View Results', 'Share via WhatsApp', 'Download Reports', 'Track Trends']
    },
    {
      id: 'health-records',
      title: 'Health Records',
      description: 'Monitor your vital signs and health metrics. Track trends, set goals, and maintain a comprehensive health profile.',
      icon: <Activity className="w-8 h-8" />,
      path: '/health-records',
      features: ['Vital Signs Tracking', 'Health Metrics', 'Trend Analysis', 'Goal Setting', 'Progress Monitoring']
    },
    {
      id: 'profile',
      title: 'Profile & Settings',
      description: 'Manage your personal information, preferences, and account settings. Update your profile and customize your experience.',
      icon: <User className="w-8 h-8" />,
      path: '/profile',
      features: ['Personal Information', 'Theme Settings', 'Privacy Controls', 'Notification Preferences', 'Account Security']
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < tourSteps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 5000); // Auto-advance every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isPlaying, tourSteps.length]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      toast.success('Tour completed! Welcome to your Patient Health Portal.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    toast.success('Tour skipped. You can restart it anytime from the dashboard.');
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const handleNavigate = () => {
    const currentStepData = tourSteps[currentStep];
    navigate(currentStepData.path);
    toast.success(`Navigating to ${currentStepData.title}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Welcome to HealthHub</h2>
              <p className="text-primary-100">Your Complete Patient Health Portal</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Step Content */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
                  <div className="text-primary-600 dark:text-primary-400">
                    {tourSteps[currentStep].icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tourSteps[currentStep].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                  {tourSteps[currentStep].description}
                </p>
              </div>

              {/* Features List */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tourSteps[currentStep].features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Step {currentStep + 1} of {tourSteps.length}</span>
                  <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-primary-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex justify-center gap-2">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleStepClick(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary-600'
                        : index < currentStep
                        ? 'bg-primary-300'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Auto Play'}
              </button>
              <button
                onClick={handleSkip}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Skip Tour
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={handleNavigate}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <MapPin size={16} />
                Go to Section
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TourGuide;
