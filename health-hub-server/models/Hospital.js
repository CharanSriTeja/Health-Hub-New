const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    maxlength: [100, 'Hospital name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['public', 'private', 'government', 'charity', 'specialty'],
    required: [true, 'Hospital type is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    },
    website: {
      type: String,
      lowercase: true
    },
    emergency: {
      type: String,
      required: [true, 'Emergency contact is required']
    }
  },
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  },
  departments: [{
    name: {
      type: String,
      required: true,
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
        'ICU',
        'NICU',
        'Laboratory',
        'Pharmacy',
        'Other'
      ]
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    description: String,
    headDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  facilities: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  capacity: {
    totalBeds: {
      type: Number,
      min: [0, 'Total beds cannot be negative']
    },
    availableBeds: {
      type: Number,
      min: [0, 'Available beds cannot be negative']
    },
    icuBeds: {
      type: Number,
      min: [0, 'ICU beds cannot be negative']
    },
    emergencyBeds: {
      type: Number,
      min: [0, 'Emergency beds cannot be negative']
    }
  },
  operatingHours: {
    monday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    thursday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    friday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    saturday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    sunday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    }
  },
  emergencyServices: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    responseTime: {
      type: Number, // in minutes
      min: [0, 'Response time cannot be negative']
    },
    specialties: [String]
  },
  insurance: [{
    provider: {
      type: String,
      required: true
    },
    isAccepted: {
      type: Boolean,
      default: true
    }
  }],
  ratings: {
    overall: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    cleanliness: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    staff: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    treatment: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
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
      enum: ['license', 'certification', 'policy', 'other']
    }
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
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ 'address.city': 1, 'address.state': 1 });
hospitalSchema.index({ coordinates: '2dsphere' });
hospitalSchema.index({ isActive: 1, verified: 1 });

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Virtual for occupancy rate
hospitalSchema.virtual('occupancyRate').get(function() {
  if (!this.capacity.totalBeds) return 0;
  return ((this.capacity.totalBeds - this.capacity.availableBeds) / this.capacity.totalBeds) * 100;
});

// Virtual for average rating
hospitalSchema.virtual('averageRating').get(function() {
  const ratings = [this.ratings.cleanliness, this.ratings.staff, this.ratings.treatment].filter(r => r > 0);
  return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
});

// Method to check if hospital is open on a specific day and time
hospitalSchema.methods.isOpen = function(day, time) {
  const daySchedule = this.operatingHours[day.toLowerCase()];
  if (!daySchedule || !daySchedule.isOpen) return false;
  
  if (!time) return true;
  
  const currentTime = new Date(`2000-01-01 ${time}`);
  const openTime = new Date(`2000-01-01 ${daySchedule.open}`);
  const closeTime = new Date(`2000-01-01 ${daySchedule.close}`);
  
  return currentTime >= openTime && currentTime <= closeTime;
};

// Method to get distance from a point
hospitalSchema.methods.getDistanceFrom = function(lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.coordinates.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Ensure virtuals are included in JSON output
hospitalSchema.set('toJSON', { virtuals: true });
hospitalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Hospital', hospitalSchema);
