const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: [true, 'Household ID is required']
  },
  fee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fee',
    required: [true, 'Fee ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be at least 0']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  payerName: {
    type: String
  },
  payerId: {
    type: String
  },
  payerPhone: {
    type: String
  },
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: {
    type: String
  },
  receiptNumber: {
    type: String
  },
  isRefunded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index to prevent duplicate payments
paymentSchema.index({ household: 1, fee: 1, paymentDate: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema); 