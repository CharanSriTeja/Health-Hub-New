const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Validation rules for user registration
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phoneNumber')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('address.zipCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Zip code must be between 3 and 20 characters'),
  body('address.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('emergencyContact.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  body('emergencyContact.relationship')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Relationship must be between 2 and 50 characters'),
  body('emergencyContact.phoneNumber')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  handleValidationErrors
];

// Validation rules for user login
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Validation rules for appointment creation
const validateAppointmentCreation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('hospital')
    .isMongoId()
    .withMessage('Valid hospital ID is required'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date'),
  body('appointmentTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid appointment time (HH:MM format)'),
  body('duration')
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('department')
    .isIn([
      'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
      'General Medicine', 'Gynecology', 'Neurology', 'Oncology',
      'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
      'Radiology', 'Surgery', 'Urology', 'Emergency', 'Other'
    ])
    .withMessage('Please provide a valid department'),
  body('appointmentType')
    .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup', 'surgery', 'other'])
    .withMessage('Please provide a valid appointment type'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  handleValidationErrors
];

// Validation rules for health record creation
const validateHealthRecordCreation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('recordType')
    .isIn(['vital-signs', 'lab-results', 'imaging', 'procedure', 'vaccination', 'allergy', 'medication', 'surgery', 'diagnosis', 'other'])
    .withMessage('Please provide a valid record type'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('provider.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Provider name must be between 2 and 100 characters'),
  body('provider.type')
    .isIn(['hospital', 'clinic', 'laboratory', 'pharmacy', 'doctor', 'other'])
    .withMessage('Please provide a valid provider type'),
  handleValidationErrors
];

// Validation rules for prescription creation
const validatePrescriptionCreation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('diagnosis')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Diagnosis must be between 5 and 500 characters'),
  body('medications')
    .isArray({ min: 1 })
    .withMessage('At least one medication is required'),
  body('medications.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  body('medications.*.dosage.amount')
    .isFloat({ min: 0 })
    .withMessage('Dosage amount must be a positive number'),
  body('medications.*.dosage.unit')
    .isIn(['mg', 'g', 'ml', 'mcg', 'units', 'tablets', 'capsules', 'drops', 'puffs', 'patches'])
    .withMessage('Please provide a valid dosage unit'),
  body('medications.*.frequency')
    .isIn(['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'every-6-hours', 'every-8-hours', 'every-12-hours', 'as-needed', 'before-meals', 'after-meals', 'at-bedtime', 'other'])
    .withMessage('Please provide a valid frequency'),
  body('medications.*.duration.value')
    .isInt({ min: 1 })
    .withMessage('Duration value must be at least 1'),
  body('medications.*.duration.unit')
    .isIn(['days', 'weeks', 'months'])
    .withMessage('Please provide a valid duration unit'),
  body('expiryDate')
    .isISO8601()
    .withMessage('Please provide a valid expiry date'),
  handleValidationErrors
];

// Validation rules for lab report creation
const validateLabReportCreation = [
  body('patient')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('doctor')
    .isMongoId()
    .withMessage('Valid doctor ID is required'),
  body('laboratory.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Laboratory name must be between 2 and 100 characters'),
  body('reportNumber')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Report number must be between 5 and 50 characters'),
  body('testDate')
    .isISO8601()
    .withMessage('Please provide a valid test date'),
  body('reportDate')
    .isISO8601()
    .withMessage('Please provide a valid report date'),
  body('testType')
    .isIn(['blood-test', 'urine-test', 'stool-test', 'culture-test', 'biopsy', 'imaging', 'genetic-test', 'allergy-test', 'hormone-test', 'cardiac-test', 'pulmonary-test', 'other'])
    .withMessage('Please provide a valid test type'),
  body('tests')
    .isArray({ min: 1 })
    .withMessage('At least one test is required'),
  body('tests.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Test name must be between 2 and 100 characters'),
  body('tests.*.result.value')
    .notEmpty()
    .withMessage('Test result is required'),
  body('specimen.type')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Specimen type must be between 2 and 50 characters'),
  body('specimen.collectionDate')
    .isISO8601()
    .withMessage('Please provide a valid collection date'),
  handleValidationErrors
];

// Validation rules for hospital creation
const validateHospitalCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hospital name must be between 2 and 100 characters'),
  body('type')
    .isIn(['public', 'private', 'government', 'charity', 'specialty'])
    .withMessage('Please provide a valid hospital type'),
  body('address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('address.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('address.state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('address.zipCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Zip code must be between 3 and 20 characters'),
  body('address.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('contact.phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('contact.emergency')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact number'),
  body('coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  handleValidationErrors
];

// Validation rules for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Validation rules for MongoDB ObjectId
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Valid MongoDB ObjectId is required'),
  handleValidationErrors
];

// Validation rules for search queries
const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateAppointmentCreation,
  validateHealthRecordCreation,
  validatePrescriptionCreation,
  validateLabReportCreation,
  validateHospitalCreation,
  validatePagination,
  validateObjectId,
  validateSearchQuery
};
