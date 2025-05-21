const Fee = require('../models/feeModel');

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private
exports.getFees = async (req, res) => {
  try {
    const fees = await Fee.find().sort({ createdAt: -1 });
    res.json(fees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single fee
// @route   GET /api/fees/:id
// @access  Private
exports.getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    res.json(fee);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a fee
// @route   POST /api/fees
// @access  Private/Admin
exports.createFee = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      amount, 
      type, 
      mandatory, 
      dueDate,
      applicableFor
    } = req.body;
    
    // Check if fee already exists
    const feeExists = await Fee.findOne({ name, type, dueDate });
    
    if (feeExists) {
      return res.status(400).json({ message: 'A fee with this name, type and due date already exists' });
    }
    
    const fee = await Fee.create({
      name,
      description,
      amount,
      type,
      mandatory,
      dueDate,
      applicableFor
    });
    
    res.status(201).json(fee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a fee
// @route   PUT /api/fees/:id
// @access  Private/Admin
exports.updateFee = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      amount, 
      type, 
      mandatory, 
      dueDate,
      applicableFor,
      active
    } = req.body;
    
    const fee = await Fee.findById(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    // Update fields
    fee.name = name || fee.name;
    fee.description = description || fee.description;
    fee.amount = amount !== undefined ? amount : fee.amount;
    fee.type = type || fee.type;
    fee.mandatory = mandatory !== undefined ? mandatory : fee.mandatory;
    fee.dueDate = dueDate || fee.dueDate;
    fee.applicableFor = applicableFor || fee.applicableFor;
    fee.active = active !== undefined ? active : fee.active;
    
    const updatedFee = await fee.save();
    
    res.json(updatedFee);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a fee (soft delete)
// @route   DELETE /api/fees/:id
// @access  Private/Admin
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    // Soft delete by setting active to false
    fee.active = false;
    await fee.save();
    
    res.json({ message: 'Fee deactivated' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get fees by type
// @route   GET /api/fees/type/:type
// @access  Private
exports.getFeesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const fees = await Fee.find({ type, active: true }).sort({ createdAt: -1 });
    
    res.json(fees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 