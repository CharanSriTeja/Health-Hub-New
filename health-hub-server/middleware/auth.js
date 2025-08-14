const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error.' 
    });
  }
};

// Middleware to check if user is a doctor
const isDoctor = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ 
      error: 'Access denied. Doctor privileges required.' 
    });
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Middleware to check if user is a patient
const isPatient = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ 
      error: 'Access denied. Patient privileges required.' 
    });
  }
  next();
};

// Middleware to check if user can access patient data
const canAccessPatientData = (req, res, next) => {
  const { patientId } = req.params;
  
  // Admin can access all data
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Doctor can access patient data
  if (req.user.role === 'doctor') {
    return next();
  }
  
  // Patient can only access their own data
  if (req.user.role === 'patient' && req.user._id.toString() === patientId) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Access denied. Insufficient privileges.' 
  });
};

// Middleware to check if user can modify data
const canModifyData = (req, res, next) => {
  const { userId } = req.params;
  
  // Admin can modify all data
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Users can only modify their own data
  if (req.user._id.toString() === userId) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Access denied. You can only modify your own data.' 
  });
};

// Middleware to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Middleware to refresh token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required.' 
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid refresh token.' 
      });
    }
    
    const newToken = generateToken(user._id);
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '30d' }
    );
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      error: 'Invalid refresh token.' 
    });
  }
};

module.exports = {
  authenticateToken,
  isDoctor,
  isAdmin,
  isPatient,
  canAccessPatientData,
  canModifyData,
  generateToken,
  refreshToken
};
