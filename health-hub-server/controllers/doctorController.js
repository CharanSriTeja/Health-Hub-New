const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const { hospital, specialization, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    if (hospital) query.hospital = hospital;
    if (specialization) query.specialization = specialization;
    
    const doctors = await Doctor.find(query)
      .populate('hospital', 'name address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, experience: -1 });
    
    const total = await Doctor.countDocuments(query);
    
    res.json({
      doctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('hospital', 'name address coordinates');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctors by hospital
const getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { specialization } = req.query;
    
    const query = { hospital: hospitalId, isActive: true };
    if (specialization) query.specialization = specialization;
    
    const doctors = await Doctor.find(query)
      .populate('hospital', 'name address')
      .sort({ rating: -1, experience: -1 });
    
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available time slots for a doctor
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Get all available slots for the day
    const allSlots = doctor.getAvailableSlots(dayOfWeek, date);
    
    // Get booked appointments for the date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      status: { $nin: ['cancelled', 'no-show'] }
    });
    
    // Filter out booked slots
    const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    
    // Debug logging
    console.log('Doctor availability:', doctor.availability[dayOfWeek]);
    console.log('All slots:', allSlots);
    console.log('Booked appointments:', bookedAppointments.length);
    console.log('Available slots:', availableSlots);
    
    res.json({
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee
      },
      date,
      availableSlots,
      totalSlots: allSlots.length,
      bookedSlots: bookedTimes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new doctor
const createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update doctor
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor statistics
const getDoctorStats = async (req, res) => {
  try {
    const stats = await Doctor.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalDoctors: { $sum: 1 },
          avgExperience: { $avg: '$experience' },
          avgRating: { $avg: '$rating.average' },
          totalReviews: { $sum: '$rating.totalReviews' }
        }
      }
    ]);
    
    const specializationStats = await Doctor.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      overall: stats[0] || {
        totalDoctors: 0,
        avgExperience: 0,
        avgRating: 0,
        totalReviews: 0
      },
      specializations: specializationStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorsByHospital,
  getAvailableSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorStats
};
