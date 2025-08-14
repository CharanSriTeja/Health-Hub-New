const Hospital = require('../models/Hospital');

// Get all hospitals
const getAllHospitals = async (req, res) => {
  try {
    const { 
      city, 
      state, 
      type, 
      specialty, 
      page = 1, 
      limit = 10,
      lat,
      lng,
      radius = 50 // default 50km radius
    } = req.query;
    
    let query = { isActive: true };
    
    // Add filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (state) query['address.state'] = new RegExp(state, 'i');
    if (type) query.type = type;
    if (specialty) query['departments.name'] = specialty;
    
    // Location-based search - we'll filter by distance after fetching
    // since coordinates are stored as separate lat/lng fields
    let hospitals = await Hospital.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'ratings.overall': -1 });
    
    const total = await Hospital.countDocuments(query);
    
    // Calculate distances and filter by radius if location provided
    let hospitalsWithDistance = hospitals;
    if (lat && lng) {
      hospitalsWithDistance = hospitals
        .map(hospital => {
          const distance = hospital.getDistanceFrom(parseFloat(lat), parseFloat(lng));
          return {
            ...hospital.toObject(),
            distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
          };
        })
        .filter(hospital => hospital.distance <= parseFloat(radius)) // Filter by radius
        .sort((a, b) => a.distance - b.distance); // Sort by distance
    }
    

    
    res.json({
      hospitals: hospitalsWithDistance,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get hospital by ID
const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search hospitals by location
const searchNearby = async (req, res) => {
  try {
    const { lat, lng, radius = 50, specialty, type } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    let query = {
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    };
    
    if (specialty) query['departments.name'] = specialty;
    if (type) query.type = type;
    
    const hospitals = await Hospital.find(query)
      .sort({ 'ratings.overall': -1 })
      .limit(20);
    
    // Add distance to each hospital
    const hospitalsWithDistance = hospitals.map(hospital => {
      const distance = hospital.getDistanceFrom(parseFloat(lat), parseFloat(lng));
      return {
        ...hospital.toObject(),
        distance: Math.round(distance * 10) / 10
      };
    });
    
    // Sort by distance
    hospitalsWithDistance.sort((a, b) => a.distance - b.distance);
    
    res.json(hospitalsWithDistance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new hospital
const createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    
    res.status(201).json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update hospital
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete hospital
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.json({ message: 'Hospital deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get hospital statistics
const getHospitalStats = async (req, res) => {
  try {
    const stats = await Hospital.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalHospitals: { $sum: 1 },
          avgRating: { $avg: '$ratings.overall' },
          totalReviews: { $sum: '$ratings.totalReviews' }
        }
      }
    ]);
    
    const typeStats = await Hospital.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const cityStats = await Hospital.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      overall: stats[0] || {
        totalHospitals: 0,
        avgRating: 0,
        totalReviews: 0
      },
      types: typeStats,
      topCities: cityStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalById,
  searchNearby,
  createHospital,
  updateHospital,
  deleteHospital,
  getHospitalStats
};
