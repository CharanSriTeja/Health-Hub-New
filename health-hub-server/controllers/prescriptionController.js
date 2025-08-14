const Prescription = require('../models/Prescription');

// Get all prescriptions for a user
const getAllPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, doctor, startDate, endDate, search } = req.query;
    const userId = req.user._id;

    let query = { user: userId };

    // Add filters
    if (status) query.status = status;
    if (doctor) query.doctorName = new RegExp(doctor, 'i');
    if (search) {
      query.$or = [
        { doctorName: new RegExp(search, 'i') },
        { 'medications.name': new RegExp(search, 'i') },
        { instructions: new RegExp(search, 'i') }
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const prescriptions = await Prescription.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const prescription = await Prescription.findOne({ _id: id, user: userId });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new prescription
const createPrescription = async (req, res) => {
  try {
    const prescriptionData = {
      ...req.body,
      user: req.user._id
    };

    const prescription = new Prescription(prescriptionData);
    await prescription.save();

    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const prescription = await Prescription.findOneAndUpdate(
      { _id: id, user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const prescription = await Prescription.findOneAndDelete({ _id: id, user: userId });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get prescription statistics
const getPrescriptionStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Prescription.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalPrescriptions: { $sum: 1 },
          activePrescriptions: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completedPrescriptions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          expiredPrescriptions: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } }
        }
      }
    ]);

    const doctorStats = await Prescription.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$doctorName',
          count: { $sum: 1 },
          specialties: { $addToSet: '$specialty' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const medicationStats = await Prescription.aggregate([
      { $match: { user: userId } },
      { $unwind: '$medications' },
      {
        $group: {
          _id: '$medications.name',
          count: { $sum: 1 },
          totalDosage: { $sum: '$medications.dosage' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      overall: stats[0] || {
        totalPrescriptions: 0,
        activePrescriptions: 0,
        completedPrescriptions: 0,
        expiredPrescriptions: 0
      },
      byDoctor: doctorStats,
      byMedication: medicationStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Share prescription
const sharePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permissions } = req.body;
    const userId = req.user._id;

    const prescription = await Prescription.findOne({ _id: id, user: userId });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Add sharing logic here (could involve creating a share token or sending email)
    // For now, we'll just return a success message
    res.json({ 
      message: 'Prescription shared successfully',
      shareUrl: `${process.env.FRONTEND_URL}/shared-prescription/${id}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export prescriptions
const exportPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { format = 'json' } = req.query;

    const prescriptions = await Prescription.find({ user: userId }).sort({ date: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = prescriptions.map(prescription => ({
        doctorName: prescription.doctorName,
        specialty: prescription.specialty,
        date: prescription.date,
        status: prescription.status,
        hospital: prescription.hospital,
        instructions: prescription.instructions,
        medications: prescription.medications.map(med => `${med.name} ${med.dosage}`).join('; ')
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=prescriptions.csv');
      
      // Simple CSV conversion
      const csv = [
        'Doctor,Specialty,Date,Status,Hospital,Instructions,Medications',
        ...csvData.map(row => 
          `"${row.doctorName}","${row.specialty}","${row.date}","${row.status}","${row.hospital}","${row.instructions}","${row.medications}"`
        )
      ].join('\n');
      
      res.send(csv);
    } else {
      res.json(prescriptions);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionStats,
  sharePrescription,
  exportPrescriptions
};
