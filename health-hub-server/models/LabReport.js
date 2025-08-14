const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
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
  laboratory: {
    name: {
      type: String,
      required: [true, 'Laboratory name is required']
    },
    address: String,
    phone: String,
    email: String,
    license: String
  },
  reportNumber: {
    type: String,
    required: [true, 'Report number is required'],
    unique: true
  },
  testDate: {
    type: Date,
    required: [true, 'Test date is required']
  },
  reportDate: {
    type: Date,
    required: [true, 'Report date is required']
  },
  testType: {
    type: String,
    enum: [
      'blood-test',
      'urine-test',
      'stool-test',
      'culture-test',
      'biopsy',
      'imaging',
      'genetic-test',
      'allergy-test',
      'hormone-test',
      'cardiac-test',
      'pulmonary-test',
      'other'
    ],
    required: [true, 'Test type is required']
  },
  tests: [{
    name: {
      type: String,
      required: [true, 'Test name is required']
    },
    code: String,
    result: {
      value: {
        type: String,
        required: [true, 'Test result is required']
      },
      unit: String,
      numericValue: Number
    },
    normalRange: {
      min: Number,
      max: Number,
      unit: String,
      gender: {
        type: String,
        enum: ['male', 'female', 'both']
      },
      ageRange: {
        min: Number,
        max: Number
      }
    },
    isAbnormal: {
      type: Boolean,
      default: false
    },
    flag: {
      type: String,
      enum: ['normal', 'high', 'low', 'critical-high', 'critical-low', 'borderline']
    },
    interpretation: String,
    methodology: String,
    turnaroundTime: String
  }],
  specimen: {
    type: {
      type: String,
      required: [true, 'Specimen type is required']
    },
    collectionDate: {
      type: Date,
      required: [true, 'Collection date is required']
    },
    collectionTime: String,
    volume: String,
    condition: String,
    notes: String
  },
  clinicalHistory: {
    type: String,
    maxlength: [1000, 'Clinical history cannot exceed 1000 characters']
  },
  diagnosis: {
    type: String,
    maxlength: [500, 'Diagnosis cannot exceed 500 characters']
  },
  findings: {
    type: String,
    maxlength: [2000, 'Findings cannot exceed 2000 characters']
  },
  conclusion: {
    type: String,
    maxlength: [1000, 'Conclusion cannot exceed 1000 characters']
  },
  recommendations: [{
    type: String,
    maxlength: [500, 'Recommendation cannot exceed 500 characters']
  }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat', 'emergency'],
    default: 'routine'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
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
      enum: ['image', 'document', 'pdf', 'chart']
    },
    size: Number
  }],
  images: [{
    name: String,
    url: String,
    description: String,
    type: {
      type: String,
      enum: ['microscopy', 'culture', 'stain', 'other']
    }
  }],
  qualityControl: {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    qualityChecks: [{
      check: String,
      result: String,
      date: Date
    }]
  },
  cost: {
    amount: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    insuranceCoverage: Number, // percentage
    patientResponsibility: Number
  },
  insurance: {
    provider: String,
    policyNumber: String,
    authorizationNumber: String,
    coverage: Number // percentage
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  isConfidential: {
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
      enum: ['view', 'download'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  digitalSignature: {
    technician: {
      name: String,
      signature: String,
      timestamp: Date
    },
    pathologist: {
      name: String,
      signature: String,
      timestamp: Date
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
labReportSchema.index({ patient: 1, reportDate: -1 });
labReportSchema.index({ doctor: 1, reportDate: -1 });
labReportSchema.index({ reportNumber: 1 });
labReportSchema.index({ status: 1 });
labReportSchema.index({ testDate: 1 });

// Virtual for checking if report is recent (within last 30 days)
labReportSchema.virtual('isRecent').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.reportDate > thirtyDaysAgo;
});

// Virtual for abnormal test count
labReportSchema.virtual('abnormalTestCount').get(function() {
  return this.tests.filter(test => test.isAbnormal).length;
});

// Virtual for critical test count
labReportSchema.virtual('criticalTestCount').get(function() {
  return this.tests.filter(test => test.flag === 'critical-high' || test.flag === 'critical-low').length;
});

// Virtual for report age in days
labReportSchema.virtual('reportAgeInDays').get(function() {
  const now = new Date();
  const reportDate = new Date(this.reportDate);
  const diffTime = Math.abs(now - reportDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for turnaround time in hours
labReportSchema.virtual('turnaroundTimeInHours').get(function() {
  const testDate = new Date(this.testDate);
  const reportDate = new Date(this.reportDate);
  const diffTime = Math.abs(reportDate - testDate);
  return Math.ceil(diffTime / (1000 * 60 * 60));
});

// Method to check if report has critical values
labReportSchema.methods.hasCriticalValues = function() {
  return this.tests.some(test => test.flag === 'critical-high' || test.flag === 'critical-low');
};

// Method to get abnormal tests
labReportSchema.methods.getAbnormalTests = function() {
  return this.tests.filter(test => test.isAbnormal);
};

// Method to get critical tests
labReportSchema.methods.getCriticalTests = function() {
  return this.tests.filter(test => test.flag === 'critical-high' || test.flag === 'critical-low');
};

// Method to check if report needs immediate attention
labReportSchema.methods.needsImmediateAttention = function() {
  return this.isUrgent || this.hasCriticalValues() || this.priority === 'stat' || this.priority === 'emergency';
};

// Method to calculate patient responsibility
labReportSchema.methods.calculatePatientResponsibility = function() {
  if (!this.cost.amount) return 0;
  if (!this.cost.insuranceCoverage) return this.cost.amount;
  return this.cost.amount * (1 - this.cost.insuranceCoverage / 100);
};

// Method to check if report can be shared
labReportSchema.methods.canBeShared = function(userId) {
  if (this.isConfidential) return false;
  return this.sharedWith.some(share => share.user.toString() === userId.toString());
};

// Ensure virtuals are included in JSON output
labReportSchema.set('toJSON', { virtuals: true });
labReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LabReport', labReportSchema);
