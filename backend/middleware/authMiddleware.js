const User = require('../models/userModel');

// Protect routes - now just passing through without JWT verification
exports.protect = async (req, res, next) => {
  try {
    // For demonstration only - this allows any request to pass through
    // and assigns the first admin user found as the authenticated user
    const adminUser = await User.findOne({ role: 'admin' }).select('-password');
    
    if (adminUser) {
      req.user = adminUser;
      next();
    } else {
      // Fallback to finding any user if no admin exists
      const anyUser = await User.findOne().select('-password');
      if (anyUser) {
        req.user = anyUser;
        next();
      } else {
        res.status(500).json({ message: 'No users found in the system' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error in authentication bypass' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} is not authorized to access this resource` 
      });
    }
    
    next();
  };
}; 