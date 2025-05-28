const Payment = require('../models/paymentModel');
const Fee = require('../models/feeModel');
const Household = require('../models/householdModel');
const asyncHandler = require('express-async-handler');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('fee', 'name feeType amount')
    .populate('household', 'householdCode apartmentNumber')
    .sort({ paymentDate: -1 });
  
  res.json(payments);
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('fee', 'name feeType amount startDate endDate')
    .populate('household', 'householdCode apartmentNumber');
  
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  
  res.json(payment);
});

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private/Admin/Accountant
const createPayment = asyncHandler(async (req, res) => {
  const { 
    fee, 
    household, 
    amount,
    paymentDate,
    payerName,
    payerId,
    payerPhone,
    receiptNumber,
    note
  } = req.body;
  
  // Check if fee exists
  const feeExists = await Fee.findById(fee);
  if (!feeExists) {
    res.status(404);
    throw new Error('Fee not found');
  }
  
  // Check if household exists
  const householdExists = await Household.findById(household);
  if (!householdExists) {
    res.status(404);
    throw new Error('Household not found');
  }
  
  // Check if payment already exists for this fee and household
  const paymentExists = await Payment.findOne({ 
    fee, 
    household
  });
  
  if (paymentExists) {
    res.status(400);
    throw new Error('A payment for this fee already exists for this household');
  }
  
  const payment = await Payment.create({
    fee,
    household,
    amount: amount || feeExists.amount,
    paymentDate: paymentDate || Date.now(),
    payerName,
    payerId,
    payerPhone,
    receiptNumber,
    collector: req.user._id, // User who created the payment
    note
  });
  
  // Populate the new payment with fee and household details
  const populatedPayment = await Payment.findById(payment._id)
    .populate('fee', 'name feeType amount')
    .populate('household', 'householdCode apartmentNumber')
    .populate('collector', 'name');
  
  res.status(201).json(populatedPayment);
});

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private/Admin/Accountant
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (payment) {
    payment.status = req.body.status || payment.status;
    payment.paymentDate = req.body.paymentDate || payment.paymentDate;
    payment.amount = req.body.amount || payment.amount;
    payment.method = req.body.method || payment.method;

    const updatedPayment = await payment.save();
    res.json(updatedPayment);
  } else {
    res.status(404);
    throw new Error('Payment not found');
  }
});

// @desc    Get payments by household
// @route   GET /api/payments/household/:id
// @access  Private
const getPaymentsByHousehold = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ household: req.params.id })
    .populate('fee', 'name amount dueDate')
    .populate('household', 'apartmentNumber');
  res.json(payments);
});

// @desc    Get payments by fee
// @route   GET /api/payments/fee/:id
// @access  Private
const getPaymentsByFee = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ fee: req.params.id })
    .populate('fee', 'name amount dueDate')
    .populate('household', 'apartmentNumber');
  res.json(payments);
});

// @desc    Search payments
// @route   GET /api/payments/search
// @access  Private
const searchPayments = asyncHandler(async (req, res) => {
  const {
    householdCode,
    apartmentNumber,
    feeName,
    feeType,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    payerName,
    keyword
  } = req.query;

  // Build search conditions
  let searchConditions = {};
  let populateConditions = {};

  // Amount range
  if (minAmount || maxAmount) {
    searchConditions.amount = {};
    if (minAmount) searchConditions.amount.$gte = parseFloat(minAmount);
    if (maxAmount) searchConditions.amount.$lte = parseFloat(maxAmount);
  }

  // Date range
  if (startDate || endDate) {
    searchConditions.paymentDate = {};
    if (startDate) searchConditions.paymentDate.$gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999); // End of day
      searchConditions.paymentDate.$lte = endDateTime;
    }
  }

  // Payer name
  if (payerName) {
    searchConditions.payerName = { $regex: payerName, $options: 'i' };
  }

  // Legacy keyword search
  if (keyword) {
    searchConditions.$or = [
      { status: { $regex: keyword, $options: 'i' } },
      { method: { $regex: keyword, $options: 'i' } },
      { payerName: { $regex: keyword, $options: 'i' } },
      { receiptNumber: { $regex: keyword, $options: 'i' } }
    ];
  }

  // Execute the query with population
  let query = Payment.find(searchConditions)
    .populate('household', 'householdCode apartmentNumber')
    .populate('fee', 'name feeType amount dueDate')
    .sort({ paymentDate: -1 });

  let payments = await query;

  // Apply additional filters that require populated data
  if (householdCode) {
    payments = payments.filter(payment => 
      payment.household?.householdCode?.toLowerCase().includes(householdCode.toLowerCase())
    );
  }

  if (apartmentNumber) {
    payments = payments.filter(payment => 
      payment.household?.apartmentNumber?.toLowerCase().includes(apartmentNumber.toLowerCase())
    );
  }

  if (feeName) {
    payments = payments.filter(payment => 
      payment.fee?.name?.toLowerCase().includes(feeName.toLowerCase())
    );
  }

  if (feeType) {
    payments = payments.filter(payment => 
      payment.fee?.feeType === feeType
    );
  }

  res.json(payments);
});

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  getPaymentsByHousehold,
  getPaymentsByFee,
  searchPayments
}; 