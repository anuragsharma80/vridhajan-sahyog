const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    unique: true,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  receiptDate: {
    type: Date,
    required: [true, 'Receipt date is required'],
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['CASH', 'NEFT', 'IMPS', 'UPI', 'RTGS', 'Cheque', 'Online Payment', 'Cash Deposit', 'TPFT', 'Swipe', 'Paytm'],
    default: 'CASH',
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member reference is required']
  },
  // Additional receipt details
  fyYear: {
    type: String,
    default: function() {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      return `F.Y. ${currentYear}-${nextYear.toString().slice(-2)}`;
    }
  },
  authenticateStock: {
    type: String,
    default: function() {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      return `VJM_AccountsFY${currentYear.toString().slice(-2)}${nextYear.toString().slice(-2)}`;
    }
  },
  bookNo: {
    type: Number,
    required: [true, 'Book number is required'],
    min: [1, 'Book number must be at least 1']
  },
  paymentId: {
    type: String,
    unique: true,
    trim: true
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  // Reference to the user who created this receipt
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
receiptSchema.index({ receiptNo: 1 });
receiptSchema.index({ member: 1 });
receiptSchema.index({ receiptDate: -1 });
receiptSchema.index({ amount: -1 });
receiptSchema.index({ paymentMode: 1 });

// Virtual for formatted amount
receiptSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(this.amount);
});

// Virtual for formatted date
receiptSchema.virtual('formattedDate').get(function() {
  return this.receiptDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtual fields are serialized
receiptSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to generate receipt number and payment ID
receiptSchema.pre('save', async function(next) {
  try {
    // Normalize payment mode to uppercase
    if (this.paymentMode) {
      this.paymentMode = this.paymentMode.toUpperCase();
    }
    
    // Generate Payment ID if not provided
    if (!this.paymentId) {
      // Find all receipts with payment IDs
      const receiptsWithPaymentId = await this.constructor.find({ 
        isActive: true,
        paymentId: { $exists: true, $ne: null }
      }).select('paymentId');
      
      let nextPaymentId = 10001; // Default starting value
      
      if (receiptsWithPaymentId.length > 0) {
        // Extract numeric values from payment IDs (handle both old and new formats)
        const numericPaymentIds = receiptsWithPaymentId
          .map(receipt => {
            const paymentId = receipt.paymentId;
            // If it's already a simple number, use it
            if (/^\d+$/.test(paymentId)) {
              return parseInt(paymentId);
            }
            // If it's the old format like "PAY071343IXDQ33", extract the number
            const match = paymentId.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          })
          .filter(id => id >= 10001); // Only consider IDs >= 10001 (our new format)
        
        if (numericPaymentIds.length > 0) {
          const maxPaymentId = Math.max(...numericPaymentIds);
          nextPaymentId = maxPaymentId + 1;
        }
      }
      
      this.paymentId = nextPaymentId.toString();
    }

    // Only process receipt number logic if bookNo is provided
    if (this.bookNo) {
      // Generate receipt number if not provided
      if (!this.receiptNo) {
        // Find the last receipt number for this book
        const lastReceipt = await this.constructor.findOne({ 
          bookNo: this.bookNo,
          isActive: true 
        }).sort({ receiptNo: -1 });
        
        let nextReceiptNo;
        if (lastReceipt && lastReceipt.receiptNo) {
          // Extract number from receipt number and increment
          const lastNumber = parseInt(lastReceipt.receiptNo);
          nextReceiptNo = lastNumber + 1;
        } else {
          // First receipt for this book
          nextReceiptNo = (this.bookNo - 1) * 25 + 1;
        }
        
        this.receiptNo = nextReceiptNo.toString();
      }

      // Validate receipt number is within correct range for the book
      if (this.receiptNo) {
        const receiptNumber = parseInt(this.receiptNo);
        const bookStart = (this.bookNo - 1) * 25 + 1;
        const bookEnd = this.bookNo * 25;
        
        if (receiptNumber < bookStart || receiptNumber > bookEnd) {
          return next(new Error(`Receipt number ${receiptNumber} is not within the valid range for Book ${this.bookNo} (${bookStart}-${bookEnd})`));
        }
      }
    }

    next();
  } catch (error) {
    console.error('Pre-save middleware error:', error);
    next(error);
  }
});

module.exports = mongoose.model('Receipt', receiptSchema);
