const Payment = require('../models/paymentModel');
const Fee = require('../models/feeModel');
const Household = require('../models/householdModel');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('fee', 'name type amount')
      .populate('household', 'householdCode apartmentNumber')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('fee', 'name type amount dueDate')
      .populate('household', 'householdCode apartmentNumber');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private/Admin/Accountant
exports.createPayment = async (req, res) => {
  try {
    const { 
      fee, 
      household, 
      amount,
      paymentDate,
      paymentMethod,
      receiptNo,
      note
    } = req.body;
    
    // Check if fee exists
    const feeExists = await Fee.findById(fee);
    if (!feeExists) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    // Check if household exists
    const householdExists = await Household.findById(household);
    if (!householdExists) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Check if payment already exists for this fee and household
    const paymentExists = await Payment.findOne({ 
      fee, 
      household,
      isRefunded: false
    });
    
    if (paymentExists) {
      return res.status(400).json({ 
        message: 'A payment for this fee already exists for this household' 
      });
    }
    
    const payment = await Payment.create({
      fee,
      household,
      amount: amount || feeExists.amount,
      paymentDate: paymentDate || Date.now(),
      paymentMethod,
      receiptNo,
      collectedBy: req.user._id, // User who created the payment
      note
    });
    
    // Populate the new payment with fee and household details
    const populatedPayment = await Payment.findById(payment._id)
      .populate('fee', 'name type amount')
      .populate('household', 'householdCode apartmentNumber')
      .populate('collectedBy', 'name');
    
    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private/Admin/Accountant
exports.updatePayment = async (req, res) => {
  try {
    const {
      amount,
      paymentDate,
      paymentMethod,
      receiptNo,
      note,
      isRefunded,
      refundReason
    } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update fields
    payment.amount = amount !== undefined ? amount : payment.amount;
    payment.paymentDate = paymentDate || payment.paymentDate;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.receiptNo = receiptNo || payment.receiptNo;
    payment.note = note !== undefined ? note : payment.note;
    
    // Handle refund
    if (isRefunded !== undefined) {
      payment.isRefunded = isRefunded;
      if (isRefunded) {
        payment.refundDate = Date.now();
        payment.refundReason = refundReason || 'No reason provided';
        payment.refundedBy = req.user._id;
      }
    }
    
    const updatedPayment = await payment.save();
    
    // Populate the updated payment
    const populatedPayment = await Payment.findById(updatedPayment._id)
      .populate('fee', 'name type amount')
      .populate('household', 'householdCode apartmentNumber')
      .populate('collectedBy', 'name')
      .populate('refundedBy', 'name');
    
    res.json(populatedPayment);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get payments by household
// @route   GET /api/payments/household/:id
// @access  Private
exports.getPaymentsByHousehold = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if household exists
    const household = await Household.findById(id);
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    const payments = await Payment.find({ household: id })
      .populate('fee', 'name type amount dueDate')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Household not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get payments by fee
// @route   GET /api/payments/fee/:id
// @access  Private
exports.getPaymentsByFee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if fee exists
    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    const payments = await Payment.find({ fee: id })
      .populate('household', 'householdCode apartmentNumber')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
}; 