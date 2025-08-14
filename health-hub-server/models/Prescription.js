const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  prescriptionDate: {
    type: Date,
    required: [true, 'Prescription date is required'],
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    maxlength: [500, 'Diagnosis cannot exceed 500 characters']
  },
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required']
    },
    genericName: String,
    dosage: {
      amount: {
        type: Number,
        required: [true, 'Dosage amount is required'],
        min: [0, 'Dosage amount cannot be negative']
      },
      unit: {
        type: String,
        required: [true, 'Dosage unit is required'],
        enum: ['mg', 'g', 'ml', 'mcg', 'units', 'tablets', 'capsules', 'drops', 'puffs', 'patches']
      },
      form: {
        type: String,
        enum: ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch', 'suppository', 'other']
      }
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: ['once-daily', 'twice-daily', 'thrice-daily', 'four-times-daily', 'every-6-hours', 'every-8-hours', 'every-12-hours', 'as-needed', 'before-meals', 'after-meals', 'at-bedtime', 'other']
    },
    duration: {
      value: {
        type: Number,
        required: [true, 'Duration value is required'],
        min: [1, 'Duration must be at least 1']
      },
      unit: {
        type: String,
        required: [true, 'Duration unit is required'],
        enum: ['days', 'weeks', 'months']
      }
    },
    instructions: {
      type: String,
      maxlength: [500, 'Instructions cannot exceed 500 characters']
    },
    specialInstructions: [{
      type: String,
      maxlength: [200, 'Special instruction cannot exceed 200 characters']
    }],
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    refills: {
      type: Number,
      default: 0,
      min: [0, 'Refills cannot be negative']
    },
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    isGeneric: {
      type: Boolean,
      default: false
    },
    contraindications: [String],
    sideEffects: [String],
    interactions: [String],
    warnings: [String]
  }],
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  },
  pharmacy: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'expired'],
    default: 'active'
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  labTests: [{
    test: {
      type: String,
      required: true
    },
    frequency: String,
    duration: String,
    instructions: String
  }],
  lifestyleRecommendations: [{
    category: {
      type: String,
      enum: ['diet', 'exercise', 'sleep', 'stress-management', 'smoking-cessation', 'alcohol-reduction', 'other']
    },
    recommendation: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'document', 'pdf']
    }
  }],
  digitalSignature: {
    doctor: {
      name: String,
      signature: String,
      timestamp: Date
    },
    patient: {
      name: String,
      signature: String,
      timestamp: Date
    }
  },
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: Number, // percentage
    copay: Number
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
prescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctor: 1, prescriptionDate: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ expiryDate: 1 });

// Virtual for checking if prescription is expired
prescriptionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual for checking if prescription is active
prescriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.isExpired;
});

// Virtual for total medication count
prescriptionSchema.virtual('totalMedications').get(function() {
  return this.medications.length;
});

// Virtual for prescription duration in days
prescriptionSchema.virtual('durationInDays').get(function() {
  if (!this.medications.length) return 0;
  
  const maxDuration = Math.max(...this.medications.map(med => {
    const duration = med.duration;
    switch (duration.unit) {
      case 'days': return duration.value;
      case 'weeks': return duration.value * 7;
      case 'months': return duration.value * 30;
      default: return duration.value;
    }
  }));
  
  return maxDuration;
});

// Method to check if prescription can be refilled
prescriptionSchema.methods.canBeRefilled = function() {
  return this.status === 'active' && !this.isExpired && this.medications.some(med => med.refills > 0);
};

// Method to get remaining refills for a medication
prescriptionSchema.methods.getRemainingRefills = function(medicationName) {
  const medication = this.medications.find(med => med.name === medicationName);
  return medication ? medication.refills : 0;
};

// Method to calculate total cost
prescriptionSchema.methods.calculateTotalCost = function() {
  return this.medications.reduce((total, med) => total + (med.cost || 0), 0);
};

// Method to get medications that need refills
prescriptionSchema.methods.getMedicationsNeedingRefills = function() {
  return this.medications.filter(med => med.refills > 0);
};

// Method to check if prescription needs follow-up
prescriptionSchema.methods.needsFollowUp = function() {
  if (!this.followUpRequired) return false;
  if (!this.followUpDate) return false;
  return new Date() >= this.followUpDate;
};

// Ensure virtuals are included in JSON output
prescriptionSchema.set('toJSON', { virtuals: true });
prescriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
