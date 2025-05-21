const Household = require('../models/householdModel');
const Resident = require('../models/residentModel');

// @desc    Get all households
// @route   GET /api/households
// @access  Private
exports.getHouseholds = async (req, res) => {
  try {
    const households = await Household.find().populate('householdHead', 'fullName');
    res.json(households);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single household
// @route   GET /api/households/:id
// @access  Private
exports.getHouseholdById = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id)
      .populate('householdHead', 'fullName dateOfBirth gender idCard');
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    res.json(household);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Household not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a household
// @route   POST /api/households
// @access  Private/Admin
exports.createHousehold = async (req, res) => {
  try {
    const { householdCode, apartmentNumber, address, note } = req.body;
    
    // Check if household already exists
    const householdExists = await Household.findOne({ householdCode });
    
    if (householdExists) {
      return res.status(400).json({ message: 'Household with this code already exists' });
    }
    
    const household = await Household.create({
      householdCode,
      apartmentNumber,
      address,
      note
    });
    
    res.status(201).json(household);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a household
// @route   PUT /api/households/:id
// @access  Private/Admin
exports.updateHousehold = async (req, res) => {
  try {
    const { householdCode, apartmentNumber, address, householdHead, note, active } = req.body;
    
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // If changing household code, check if it's already in use
    if (householdCode && householdCode !== household.householdCode) {
      const codeExists = await Household.findOne({ householdCode });
      if (codeExists) {
        return res.status(400).json({ message: 'Household code already in use' });
      }
    }
    
    // If setting household head, verify the resident exists
    if (householdHead && householdHead !== household.householdHead) {
      const resident = await Resident.findById(householdHead);
      if (!resident) {
        return res.status(404).json({ message: 'Resident not found for household head' });
      }
    }
    
    household.householdCode = householdCode || household.householdCode;
    household.apartmentNumber = apartmentNumber || household.apartmentNumber;
    household.address = address || household.address;
    household.householdHead = householdHead || household.householdHead;
    household.note = note !== undefined ? note : household.note;
    household.active = active !== undefined ? active : household.active;
    
    const updatedHousehold = await household.save();
    
    res.json(updatedHousehold);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Household not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a household (soft delete)
// @route   DELETE /api/households/:id
// @access  Private/Admin
exports.deleteHousehold = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    // Soft delete by setting active to false
    household.active = false;
    await household.save();
    
    res.json({ message: 'Household deactivated' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Household not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get residents in a household
// @route   GET /api/households/:id/residents
// @access  Private
exports.getHouseholdResidents = async (req, res) => {
  try {
    const household = await Household.findById(req.params.id);
    
    if (!household) {
      return res.status(404).json({ message: 'Household not found' });
    }
    
    const residents = await Resident.find({ household: req.params.id });
    
    res.json(residents);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Household not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
}; 