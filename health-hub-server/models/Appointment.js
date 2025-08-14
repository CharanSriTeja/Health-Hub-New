const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [180, 'Duration cannot exceed 3 hours']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
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
      'Emergency',
      'Other'
    ]
  },
  appointmentType: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup', 'surgery', 'other']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  doctorNotes: {
    type: String,
    maxlength: [1000, 'Doctor notes cannot exceed 1000 characters']
  },
  diagnosis: {
    type: String,
    maxlength: [500, 'Diagnosis cannot exceed 500 characters']
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  labTests: [{
    test: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ordered', 'in-progress', 'completed'],
      default: 'ordered'
    },
    result: String,
    labReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabReport'
    }
  }],
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    maxlength: [500, 'Follow-up notes cannot exceed 500 characters']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'waived'],
    default: 'pending'
  },
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: Number // percentage
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ hospital: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
  return new Date() > this.appointmentDate;
});

// Virtual for checking if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return today.toDateString() === appointmentDate.toDateString();
});

// Virtual for appointment status color
appointmentSchema.virtual('statusColor').get(function() {
  const statusColors = {
    'scheduled': 'blue',
    'confirmed': 'green',
    'in-progress': 'orange',
    'completed': 'green',
    'cancelled': 'red',
    'no-show': 'red'
  };
  return statusColors[this.status] || 'gray';
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentTime = new Date(this.appointmentDate);
  const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);
  
  return this.status === 'scheduled' && hoursDifference > 24;
};

// Method to get appointment duration in hours
appointmentSchema.methods.getDurationInHours = function() {
  return this.duration / 60;
};

// Ensure virtuals are included in JSON output
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
