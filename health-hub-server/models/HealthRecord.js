const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  recordType: {
    type: String,
    enum: ['vital-signs', 'lab-results', 'imaging', 'procedure', 'vaccination', 'allergy', 'medication', 'surgery', 'diagnosis', 'other'],
    required: [true, 'Record type is required']
  },
  title: {
    type: String,
    required: [true, 'Record title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Record date is required']
  },
  provider: {
    name: {
      type: String,
      required: [true, 'Provider name is required']
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'laboratory', 'pharmacy', 'doctor', 'other'],
      required: [true, 'Provider type is required']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    }
  },
  vitalSigns: {
    bloodPressure: {
      systolic: {
        type: Number,
        min: [0, 'Systolic pressure cannot be negative']
      },
      diastolic: {
        type: Number,
        min: [0, 'Diastolic pressure cannot be negative']
      },
      unit: {
        type: String,
        default: 'mmHg'
      }
    },
    heartRate: {
      value: {
        type: Number,
        min: [0, 'Heart rate cannot be negative']
      },
      unit: {
        type: String,
        default: 'bpm'
      }
    },
    temperature: {
      value: {
        type: Number
      },
      unit: {
        type: String,
        default: '°C'
      }
    },
    weight: {
      value: {
        type: Number,
        min: [0, 'Weight cannot be negative']
      },
      unit: {
        type: String,
        default: 'kg'
      }
    },
    height: {
      value: {
        type: Number,
        min: [0, 'Height cannot be negative']
      },
      unit: {
        type: String,
        default: 'cm'
      }
    },
    oxygenSaturation: {
      value: {
        type: Number,
        min: [0, 'Oxygen saturation cannot be negative'],
        max: [100, 'Oxygen saturation cannot exceed 100%']
      },
      unit: {
        type: String,
        default: '%'
      }
    },
    respiratoryRate: {
      value: {
        type: Number,
        min: [0, 'Respiratory rate cannot be negative']
      },
      unit: {
        type: String,
        default: 'breaths/min'
      }
    }
  },
  labResults: {
    testName: {
      type: String,
      required: function() { return this.recordType === 'lab-results'; }
    },
    result: {
      type: String,
      required: function() { return this.recordType === 'lab-results'; }
    },
    normalRange: {
      min: Number,
      max: Number,
      unit: String
    },
    isAbnormal: {
      type: Boolean,
      default: false
    },
    labReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabReport'
    }
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    sideEffects: [String],
    allergies: [String]
  }],
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    reaction: String,
    discoveredDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  surgeries: [{
    procedure: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    surgeon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    complications: [String],
    recoveryNotes: String
  }],
  vaccinations: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    nextDueDate: Date,
    provider: String,
    batchNumber: String,
    administeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  imaging: {
    type: {
      type: String,
      enum: ['x-ray', 'ct-scan', 'mri', 'ultrasound', 'pet-scan', 'other']
    },
    bodyPart: String,
    findings: String,
    radiologist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    imageUrl: String
  },
  procedures: [{
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    description: String,
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital'
    },
    complications: [String],
    followUpRequired: {
      type: Boolean,
      default: false
    }
  }],
  diagnoses: [{
    condition: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    diagnosedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: String
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
      enum: ['image', 'document', 'pdf', 'other']
    },
    size: Number
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
healthRecordSchema.index({ patient: 1, date: -1 });
healthRecordSchema.index({ patient: 1, recordType: 1 });
healthRecordSchema.index({ 'provider.id': 1 });
healthRecordSchema.index({ tags: 1 });

// Virtual for BMI calculation
healthRecordSchema.virtual('bmi').get(function() {
  if (this.vitalSigns.weight && this.vitalSigns.height) {
    const weightKg = this.vitalSigns.weight.value;
    const heightM = this.vitalSigns.height.value / 100;
    return (weightKg / (heightM * heightM)).toFixed(1);
  }
  return null;
});

// Virtual for BMI category
healthRecordSchema.virtual('bmiCategory').get(function() {
  const bmi = this.bmi;
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
});

// Virtual for blood pressure category
healthRecordSchema.virtual('bloodPressureCategory').get(function() {
  if (!this.vitalSigns.bloodPressure) return null;
  
  const systolic = this.vitalSigns.bloodPressure.systolic;
  const diastolic = this.vitalSigns.bloodPressure.diastolic;
  
  if (systolic < 120 && diastolic < 80) return 'Normal';
  if (systolic < 130 && diastolic < 80) return 'Elevated';
  if (systolic < 140 || diastolic < 90) return 'Stage 1 Hypertension';
  return 'Stage 2 Hypertension';
});

// Method to check if record is recent (within last 30 days)
healthRecordSchema.methods.isRecent = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.date > thirtyDaysAgo;
};

// Method to get age at time of record
healthRecordSchema.methods.getAgeAtRecord = function() {
  // This would need to be calculated using patient's date of birth
  // Implementation would require patient data
  return null;
};

// Ensure virtuals are included in JSON output
healthRecordSchema.set('toJSON', { virtuals: true });
healthRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
