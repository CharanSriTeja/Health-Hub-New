const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'User with this email or phone number already exists'
      });
    }

    res.status(500).json({
      error: 'Registration failed. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
    );

    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture
        },
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expired'
      });
    }

    res.status(500).json({
      error: 'Token refresh failed. Please try again.'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile. Please try again.'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed. Please try again.'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password. Please try again.'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: 'User with this email not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // In a real application, you would send this token via email
    // For now, we'll just return it in the response
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      data: {
        resetToken // Remove this in production
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Failed to process forgot password request. Please try again.'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        error: 'Reset token and new password are required'
      });
    }

    // Verify reset token
    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        error: 'Invalid reset token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        error: 'Reset token has expired'
      });
    }

    res.status(500).json({
      error: 'Failed to reset password. Please try again.'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  changePassword,
  forgotPassword,
  resetPassword
};
