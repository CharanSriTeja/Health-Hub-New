const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      hospital,
      appointmentDate,
      appointmentTime,
      duration,
      department,
      appointmentType,
      status,
      reason,
      symptoms,
      notes
    } = req.body;

    // Check if patient exists
    const patientExists = await User.findById(patient);
    if (!patientExists || patientExists.role !== 'patient') {
      return res.status(400).json({
        error: 'Invalid patient ID'
      });
    }

    // Check if doctor exists
    const doctorExists = await User.findById(doctor);
    if (!doctorExists || doctorExists.role !== 'doctor') {
      return res.status(400).json({
        error: 'Invalid doctor ID'
      });
    }

    // Check if hospital exists
    const hospitalExists = await Hospital.findById(hospital);
    if (!hospitalExists) {
      return res.status(400).json({
        error: 'Invalid hospital ID'
      });
    }

    // Check for appointment conflicts
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const endTime = new Date(appointmentDateTime.getTime() + duration * 60000);

    const conflictingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: appointmentDate,
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        {
          appointmentTime: {
            $lt: endTime.toTimeString().slice(0, 5),
            $gte: appointmentTime
          }
        },
        {
          $expr: {
            $and: [
              { $gte: ['$appointmentTime', appointmentTime] },
              { $lt: ['$appointmentTime', endTime.toTimeString().slice(0, 5)] }
            ]
          }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        error: 'Doctor has a conflicting appointment at this time'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patient,
      doctor,
      hospital,
      appointmentDate,
      appointmentTime,
      duration,
      department,
      appointmentType,
      status: status || 'scheduled',
      reason,
      symptoms,
      notes
    });

    await appointment.save();

    // Populate references
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phoneNumber' },
      { path: 'doctor', select: 'firstName lastName email' },
      { path: 'hospital', select: 'name address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      error: 'Failed to create appointment. Please try again.'
    });
  }
};

// @desc    Get all appointments (with filtering and pagination)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Filter by user role
    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.department) {
      filter.department = req.query.department;
    }

    if (req.query.appointmentType) {
      filter.appointmentType = req.query.appointmentType;
    }

    if (req.query.date) {
      filter.appointmentDate = req.query.date;
    }

    if (req.query.dateRange) {
      const [startDate, endDate] = req.query.dateRange.split(',');
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (req.query.search) {
      filter.$or = [
        { reason: { $regex: req.query.search, $options: 'i' } },
        { notes: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get appointments with pagination
    const appointments = await Appointment.find(filter)
      .populate([
        { path: 'patient', select: 'firstName lastName email phoneNumber' },
        { path: 'doctor', select: 'firstName lastName email' },
        { path: 'hospital', select: 'name address' }
      ])
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Failed to get appointments. Please try again.'
    });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate([
        { path: 'patient', select: 'firstName lastName email phoneNumber dateOfBirth gender bloodGroup address emergencyContact medicalHistory' },
        { path: 'doctor', select: 'firstName lastName email' },
        { path: 'hospital', select: 'name address contact' },
        { path: 'prescription' },
        { path: 'labTests.labReport' }
      ]);

    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid appointment ID'
      });
    }

    res.status(500).json({
      error: 'Failed to get appointment. Please try again.'
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const {
      appointmentDate,
      appointmentTime,
      duration,
      department,
      appointmentType,
      status,
      reason,
      symptoms,
      notes,
      doctorNotes,
      diagnosis,
      followUpDate,
      followUpNotes,
      cost,
      paymentStatus
    } = req.body;

    // Update fields
    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (duration) appointment.duration = duration;
    if (department) appointment.department = department;
    if (appointmentType) appointment.appointmentType = appointmentType;
    if (status) appointment.status = status;
    if (reason) appointment.reason = reason;
    if (symptoms) appointment.symptoms = symptoms;
    if (notes) appointment.notes = notes;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (followUpDate) appointment.followUpDate = followUpDate;
    if (followUpNotes) appointment.followUpNotes = followUpNotes;
    if (cost) appointment.cost = cost;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;

    await appointment.save();

    // Populate references
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phoneNumber' },
      { path: 'doctor', select: 'firstName lastName email' },
      { path: 'hospital', select: 'name address' }
    ]);

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      error: 'Failed to update appointment. Please try again.'
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        error: 'Appointment cannot be cancelled. It must be at least 24 hours in advance.'
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        error: 'Invalid appointment ID'
      });
    }

    res.status(500).json({
      error: 'Failed to delete appointment. Please try again.'
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
const getAppointmentStats = async (req, res) => {
  try {
    const filter = {};

    // Filter by user role
    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctor = req.user._id;
    }

    const totalAppointments = await Appointment.countDocuments(filter);
    const todayAppointments = await Appointment.countDocuments({
      ...filter,
      appointmentDate: new Date().toISOString().split('T')[0]
    });

    const appointmentsByStatus = await Appointment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const appointmentsByDepartment = await Appointment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const upcomingAppointments = await Appointment.find({
      ...filter,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate([
        { path: 'patient', select: 'firstName lastName' },
        { path: 'doctor', select: 'firstName lastName' },
        { path: 'hospital', select: 'name' }
      ])
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalAppointments,
        todayAppointments,
        appointmentsByStatus,
        appointmentsByDepartment,
        upcomingAppointments
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      error: 'Failed to get appointment statistics. Please try again.'
    });
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/available-slots
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    const { doctor, date, duration = 30 } = req.query;

    if (!doctor || !date) {
      return res.status(400).json({
        error: 'Doctor ID and date are required'
      });
    }

    // Get doctor's working hours (you might want to store this in the User model)
    const workingHours = {
      start: '09:00',
      end: '17:00'
    };

    // Get existing appointments for the doctor on the specified date
    const existingAppointments = await Appointment.find({
      doctor,
      appointmentDate: date,
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('appointmentTime duration');

    // Generate time slots
    const slots = [];
    const startTime = new Date(`2000-01-01T${workingHours.start}`);
    const endTime = new Date(`2000-01-01T${workingHours.end}`);

    while (startTime < endTime) {
      const slotTime = startTime.toTimeString().slice(0, 5);
      
      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(`2000-01-01T${appointment.appointmentTime}`);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
        const slotEnd = new Date(startTime.getTime() + duration * 60000);
        
        return (startTime < appointmentEnd && slotEnd > appointmentStart);
      });

      if (!hasConflict) {
        slots.push(slotTime);
      }

      startTime.setMinutes(startTime.getMinutes() + 30); // 30-minute intervals
    }

    res.json({
      success: true,
      data: {
        slots,
        date,
        doctor
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      error: 'Failed to get available slots. Please try again.'
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats,
  getAvailableSlots
};
