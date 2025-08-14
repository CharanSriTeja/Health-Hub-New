const User = require('../models/User');

// @desc    Get all users (with pagination and filtering)
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to get users. Please try again.'
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    res.status(500).json({
      error: 'Failed to get user. Please try again.'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalHistory,
      profilePicture
    } = req.body;

    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (bloodGroup) user.bloodGroup = bloodGroup;
    if (address) user.address = address;
    if (emergencyContact) user.emergencyContact = emergencyContact;
    if (medicalHistory) user.medicalHistory = medicalHistory;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          bloodGroup: user.bloodGroup,
          address: user.address,
          emergencyContact: user.emergencyContact,
          medicalHistory: user.medicalHistory,
          profilePicture: user.profilePicture,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Phone number already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to update user. Please try again.'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    res.status(500).json({
      error: 'Failed to delete user. Please try again.'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const usersByGender = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        usersByGender,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics. Please try again.'
    });
  }
};

// @desc    Get doctors
// @route   GET /api/users/doctors
// @access  Private
const getDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'doctor', isActive: true };
    
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(filter)
      .select('-password')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      error: 'Failed to get doctors. Please try again.'
    });
  }
};

// @desc    Get patients
// @route   GET /api/users/patients
// @access  Private (Doctors and Admins)
const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'patient', isActive: true };
    
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const patients = await User.find(filter)
      .select('-password')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      error: 'Failed to get patients. Please try again.'
    });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be patient, doctor, or admin'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: 'Failed to update user role. Please try again.'
    });
  }
};

// @desc    Activate/Deactivate user
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      error: 'Failed to update user status. Please try again.'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getDoctors,
  getPatients,
  updateUserRole,
  updateUserStatus
};
