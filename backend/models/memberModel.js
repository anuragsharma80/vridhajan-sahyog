const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const memberSchema = new mongoose.Schema({
  universalKey: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4()
  },
  regNo: {
    type: Number,
    unique: true,
    required: [true, 'Registration number is required']
  },
  daniMemberNo: {
    type: String,
    unique: true,
    required: [true, 'Dani Member Number is required'],
    trim: true
  },
  memberName: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
    maxlength: [100, 'Member name cannot exceed 100 characters']
  },
  fatherHusbandName: {
    type: String,
    trim: true,
    maxlength: [100, 'Father/Husband name cannot exceed 100 characters']
  },
  address: {
    add1: {
      type: String,
      trim: true,
      maxlength: [200, 'Address line 1 cannot exceed 200 characters']
    },
    add2: {
      type: String,
      trim: true,
      maxlength: [200, 'Address line 2 cannot exceed 200 characters']
    },
    add3: {
      type: String,
      trim: true,
      maxlength: [200, 'Address line 3 cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    pinCode: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty values
          return /^\d{6}$/.test(v);
        },
        message: 'Pin code must be exactly 6 digits'
      }
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
  },
  contact: {
    mob1: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty values
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Mobile number must be 10 digits starting with 6, 7, 8, or 9'
      }
    },
    mobNo2: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty values
          return /^[6-9]\d{9}$/.test(v);
        },
        message: 'Mobile number 2 must be 10 digits starting with 6, 7, 8, or 9'
      }
    },
    emailId: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty values
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email'
      }
    }
  },
  identification: {
    panNo: {
      type: String,
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty values
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
        },
        message: 'Please enter a valid PAN number'
      }
    },
    aadharNo: {
      type: String,
      trim: true,
      set: function(value) {
        // Remove spaces and return only digits
        return value ? value.replace(/\s/g, '') : value;
      },
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty values
          return /^\d{12}$/.test(v);
        },
        message: 'Please enter a valid 12-digit Aadhar number'
      }
    },
    otherIdType: {
      type: String,
      trim: true
    },
    otherIdValue: {
      type: String,
      trim: true
    }
  },
  personal: {
    occupation: {
      type: String,
      trim: true,
      maxlength: [50, 'Occupation cannot exceed 50 characters']
    },
    qualification: {
      type: String,
      trim: true,
      maxlength: [50, 'Qualification cannot exceed 50 characters']
    },
    dateOfBirth: {
      type: Date
    },
    anniversaryDate: {
      type: Date
    }
  },
  spiritual: {
    dikshaPlace: {
      type: String,
      trim: true,
      maxlength: [100, 'Diksha place cannot exceed 100 characters']
    },
    dikshaDate: {
      type: Date
    }
  },
  membership: {
    regAmount: {
      type: Number,
      default: 0,
      min: [0, 'Registration amount cannot be negative']
    },
    cardClass: {
      type: String,
      trim: true
    },
    issueDate: {
      type: Date
    },
    validity: {
      type: Date
    }
  },
  additional: {
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    activity: {
      type: String,
      trim: true,
      maxlength: [50, 'Activity cannot exceed 50 characters']
    },
    gift: {
      type: String,
      trim: true
    }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
memberSchema.index({ regNo: 1 });
memberSchema.index({ memberName: 'text', 'contact.mob1': 1 });
memberSchema.index({ universalKey: 1 });

// Virtual for full address
memberSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  const parts = [addr.add1, addr.add2, addr.add3, addr.city, addr.state, addr.pinCode, addr.country];
  return parts.filter(part => part && part.trim()).join(', ');
});

// Ensure virtual fields are serialized
memberSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
