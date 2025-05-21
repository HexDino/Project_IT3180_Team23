const Household = require('../models/householdModel');
const Resident = require('../models/residentModel');
const Fee = require('../models/feeModel');
const Payment = require('../models/paymentModel');
const TemporaryResidence = require('../models/temporaryResidenceModel');
const TemporaryAbsence = require('../models/temporaryAbsenceModel');

// @desc    Get dashboard statistics
// @route   GET /api/statistics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const householdCount = await Household.countDocuments({ active: true });
    const residentCount = await Resident.countDocuments({ active: true });
    const feeCount = await Fee.countDocuments({ active: true });
    
    // Get payment stats
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    
    const currentMonthEnd = new Date();
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
    currentMonthEnd.setDate(0);
    currentMonthEnd.setHours(23, 59, 59, 999);
    
    const paymentsThisMonth = await Payment.find({
      paymentDate: { 
        $gte: currentMonthStart, 
        $lte: currentMonthEnd 
      },
      isRefunded: false
    });
    
    const monthlyRevenue = paymentsThisMonth.reduce((total, payment) => total + payment.amount, 0);
    
    // Get counts for temporary residences and absences
    const tempResidenceCount = await TemporaryResidence.countDocuments({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    const tempAbsenceCount = await TemporaryAbsence.countDocuments({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    // Get most recent payments
    const recentPayments = await Payment.find()
      .populate('household', 'householdCode apartmentNumber')
      .populate('fee', 'name type')
      .sort({ paymentDate: -1 })
      .limit(5);
    
    // Calculate revenue by fee type
    const allPayments = await Payment.find({ isRefunded: false })
      .populate('fee', 'feeType');
    
    const revenueByType = {};
    
    allPayments.forEach(payment => {
      const feeType = payment.fee?.feeType || 'other';
      
      if (!revenueByType[feeType]) {
        revenueByType[feeType] = 0;
      }
      
      revenueByType[feeType] += payment.amount;
    });
    
    res.json({
      counts: {
        households: householdCount,
        residents: residentCount,
        fees: feeCount,
        temporaryResidences: tempResidenceCount,
        temporaryAbsences: tempAbsenceCount
      },
      financials: {
        monthlyRevenue,
        revenueByType
      },
      recentPayments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get household payment status
// @route   GET /api/statistics/payment-status
// @access  Private
exports.getPaymentStatus = async (req, res) => {
  try {
    // Get all active households
    const households = await Household.find({ active: true });
    
    // Get mandatory fees
    const mandatoryFees = await Fee.find({ 
      mandatory: true,
      active: true,
      dueDate: { $lte: new Date() }
    });
    
    // Get all payments
    const payments = await Payment.find({ 
      isRefunded: false,
      fee: { $in: mandatoryFees.map(fee => fee._id) }
    });
    
    // Create payment status for each household
    const paymentStatus = [];
    
    for (const household of households) {
      const householdPayments = payments.filter(
        payment => payment.household.toString() === household._id.toString()
      );
      
      const paidFees = householdPayments.map(payment => payment.fee.toString());
      
      const unpaidFees = mandatoryFees.filter(
        fee => !paidFees.includes(fee._id.toString())
      );
      
      paymentStatus.push({
        household: {
          _id: household._id,
          householdCode: household.householdCode,
          apartmentNumber: household.apartmentNumber
        },
        status: unpaidFees.length === 0 ? 'Paid' : 'Unpaid',
        paidCount: paidFees.length,
        unpaidCount: unpaidFees.length,
        totalFees: mandatoryFees.length
      });
    }
    
    res.json(paymentStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get monthly payment report
// @route   GET /api/statistics/monthly-report
// @access  Private
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Set date range for the report
    const startDate = new Date(year || new Date().getFullYear(), (month ? month - 1 : new Date().getMonth()), 1);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of the month
    endDate.setHours(23, 59, 59, 999);
    
    // Get payments for the specified month
    const payments = await Payment.find({
      paymentDate: { $gte: startDate, $lte: endDate },
      isRefunded: false
    })
      .populate('fee', 'name type amount')
      .populate('household', 'householdCode apartmentNumber')
      .sort({ paymentDate: 1 });
    
    // Calculate totals by fee type
    const totalsByType = {};
    payments.forEach(payment => {
      const type = payment.fee?.type || 'other';
      
      if (!totalsByType[type]) {
        totalsByType[type] = 0;
      }
      
      totalsByType[type] += payment.amount;
    });
    
    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get payment count by day of month
    const paymentsByDay = {};
    payments.forEach(payment => {
      const day = payment.paymentDate.getDate();
      
      if (!paymentsByDay[day]) {
        paymentsByDay[day] = {
          count: 0,
          amount: 0
        };
      }
      
      paymentsByDay[day].count += 1;
      paymentsByDay[day].amount += payment.amount;
    });
    
    res.json({
      period: {
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        startDate,
        endDate
      },
      summary: {
        totalRevenue,
        paymentCount: payments.length,
        totalsByType
      },
      paymentsByDay,
      payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 