const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true,
    maxlength: [100, 'Doctor name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'General Medicine',
      'Gynecology',
      'Neurology',
      'Oncology',
      'Ophthalmology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Surgery',
      'Urology',
      'Emergency Medicine',
      'Other'
    ]
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    required: [true, 'Experience is required']
  },
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingAuthority: String,
    year: Number,
    expiryDate: Date
  }],
  availability: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String,
      maxPatients: { type: Number, default: 20 }
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String,
      maxPatients: { type: Number, default: 20 }
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String,
      maxPatients: { type: Number, default: 20 }
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String,
      maxPatients: { type: Number, default: 20 }
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      startTime: String,
      endTime: String,
      maxPatients: { type: Number, default: 20 }
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      maxPatients: { type: Number, default: 10 }
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      maxPatients: { type: Number, default: 10 }
    }
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    }
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  languages: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
doctorSchema.index({ hospital: 1, specialization: 1 });
doctorSchema.index({ email: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ isActive: 1, verified: 1 });

// Virtual for full name
doctorSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if doctor is available on a specific day and time
doctorSchema.methods.isAvailable = function(day, time) {
  const daySchedule = this.availability[day.toLowerCase()];
  if (!daySchedule || !daySchedule.isAvailable) return false;
  
  if (!time) return true;
  
  const currentTime = new Date(`2000-01-01 ${time}`);
  const startTime = new Date(`2000-01-01 ${daySchedule.startTime}`);
  const endTime = new Date(`2000-01-01 ${daySchedule.endTime}`);
  
  return currentTime >= startTime && currentTime <= endTime;
};

// Method to get available time slots for a specific day
doctorSchema.methods.getAvailableSlots = function(day, date) {
  const daySchedule = this.availability[day.toLowerCase()];
  if (!daySchedule || !daySchedule.isAvailable) return [];
  
  const slots = [];
  const startTime = new Date(`2000-01-01 ${daySchedule.startTime}`);
  const endTime = new Date(`2000-01-01 ${daySchedule.endTime}`);
  const slotDuration = 30; // 30 minutes per slot
  
  let currentSlot = new Date(startTime);
  
  while (currentSlot < endTime) {
    slots.push(currentSlot.toTimeString().slice(0, 5));
    currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
  }
  
  return slots;
};

// Ensure virtuals are included in JSON output
doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);
