const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
require('dotenv').config();

// Sample hospitals data
const hospitalsData = [
  {
    name: "King George Hospital (KGH)",
    type: "government",
    address: {
      street: "Maharanipeta",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      zipCode: "530002",
      country: "India"
    },
    contact: {
      phone: "+91 891 2562244",
      email: "info@kghvizag.org",
      website: "http://kghvizag.org",
      emergency: "+91 891 2562245"
    },
    coordinates: {
      latitude: 17.6999,
      longitude: 83.3050
    },
    departments: [
      { name: "Cardiology", isAvailable: true, description: "Heart care and treatment" },
      { name: "Dermatology", isAvailable: true, description: "Skin care and treatment" },
      { name: "General Medicine", isAvailable: true, description: "General medical care" },
      { name: "Orthopedics", isAvailable: true, description: "Bone and joint care" },
      { name: "Pediatrics", isAvailable: true, description: "Child care and treatment" }
    ],
    facilities: [
      { name: "Emergency Care", isAvailable: true },
      { name: "ICU", isAvailable: true },
      { name: "Trauma Center", isAvailable: true },
      { name: "Blood Bank", isAvailable: true },
      { name: "Radiology", isAvailable: true },
      { name: "Pharmacy", isAvailable: true }
    ],
    services: [
      { name: "General Consultation", cost: 100, isAvailable: true },
      { name: "Emergency Care", cost: 500, isAvailable: true },
      { name: "Laboratory Tests", cost: 200, isAvailable: true }
    ],
    capacity: {
      totalBeds: 500,
      availableBeds: 150,
      icuBeds: 50,
      emergencyBeds: 20
    },
    operatingHours: {
      monday: { open: "08:00", close: "20:00", isOpen: true },
      tuesday: { open: "08:00", close: "20:00", isOpen: true },
      wednesday: { open: "08:00", close: "20:00", isOpen: true },
      thursday: { open: "08:00", close: "20:00", isOpen: true },
      friday: { open: "08:00", close: "20:00", isOpen: true },
      saturday: { open: "08:00", close: "18:00", isOpen: true },
      sunday: { open: "08:00", close: "16:00", isOpen: true }
    },
    emergencyServices: {
      isAvailable: true,
      responseTime: 15,
      specialties: ["Trauma", "Cardiac", "Neurology"]
    },
    insurance: [
      { provider: "Government Health Scheme", isAccepted: true },
      { provider: "Private Insurance", isAccepted: true }
    ],
    ratings: {
      overall: 4.5,
      cleanliness: 4.3,
      staff: 4.6,
      treatment: 4.4,
      totalReviews: 2150
    },
    isActive: true,
    verified: true
  },
  {
    name: "Andhra Medical College",
    type: "government",
    address: {
      street: "Panjab University Rd",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      zipCode: "530003",
      country: "India"
    },
    contact: {
      phone: "+91 891 2561152",
      email: "info@amc.edu.in",
      website: "http://amc.edu.in",
      emergency: "+91 891 2561153"
    },
    coordinates: {
      latitude: 17.7289,
      longitude: 83.3185
    },
    departments: [
      { name: "Cardiology", isAvailable: true, description: "Heart care and treatment" },
      { name: "Dermatology", isAvailable: true, description: "Skin care and treatment" },
      { name: "General Medicine", isAvailable: true, description: "General medical care" },
      { name: "Neurology", isAvailable: true, description: "Brain and nerve care" },
      { name: "Oncology", isAvailable: true, description: "Cancer treatment" }
    ],
    facilities: [
      { name: "Emergency Care", isAvailable: true },
      { name: "ICU", isAvailable: true },
      { name: "Laboratory", isAvailable: true },
      { name: "Pharmacy", isAvailable: true },
      { name: "Radiology", isAvailable: true }
    ],
    services: [
      { name: "General Consultation", cost: 150, isAvailable: true },
      { name: "Specialist Consultation", cost: 300, isAvailable: true },
      { name: "Laboratory Tests", cost: 250, isAvailable: true }
    ],
    capacity: {
      totalBeds: 300,
      availableBeds: 80,
      icuBeds: 30,
      emergencyBeds: 15
    },
    operatingHours: {
      monday: { open: "08:00", close: "20:00", isOpen: true },
      tuesday: { open: "08:00", close: "20:00", isOpen: true },
      wednesday: { open: "08:00", close: "20:00", isOpen: true },
      thursday: { open: "08:00", close: "20:00", isOpen: true },
      friday: { open: "08:00", close: "20:00", isOpen: true },
      saturday: { open: "08:00", close: "18:00", isOpen: true },
      sunday: { open: "08:00", close: "16:00", isOpen: true }
    },
    emergencyServices: {
      isAvailable: true,
      responseTime: 20,
      specialties: ["General", "Cardiac", "Trauma"]
    },
    insurance: [
      { provider: "Government Health Scheme", isAccepted: true },
      { provider: "Private Insurance", isAccepted: true }
    ],
    ratings: {
      overall: 4.6,
      cleanliness: 4.4,
      staff: 4.7,
      treatment: 4.5,
      totalReviews: 1890
    },
    isActive: true,
    verified: true
  },
  {
    name: "Apollo Hospitals",
    type: "private",
    address: {
      street: "Waltair Main Road",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      zipCode: "530002",
      country: "India"
    },
    contact: {
      phone: "+91 891 2525252",
      email: "info@apollovizag.com",
      website: "http://apollovizag.com",
      emergency: "+91 891 2525253"
    },
    coordinates: {
      latitude: 17.7100,
      longitude: 83.3000
    },
    departments: [
      { name: "Cardiology", isAvailable: true, description: "Advanced heart care" },
      { name: "Dermatology", isAvailable: true, description: "Skin care and treatment" },
      { name: "General Medicine", isAvailable: true, description: "General medical care" },
      { name: "Orthopedics", isAvailable: true, description: "Bone and joint care" },
      { name: "Neurology", isAvailable: true, description: "Brain and nerve care" },
      { name: "Oncology", isAvailable: true, description: "Cancer treatment" }
    ],
    facilities: [
      { name: "Emergency Care", isAvailable: true },
      { name: "ICU", isAvailable: true },
      { name: "NICU", isAvailable: true },
      { name: "Blood Bank", isAvailable: true },
      { name: "Radiology", isAvailable: true },
      { name: "Pharmacy", isAvailable: true },
      { name: "Cafeteria", isAvailable: true }
    ],
    services: [
      { name: "General Consultation", cost: 500, isAvailable: true },
      { name: "Specialist Consultation", cost: 800, isAvailable: true },
      { name: "Laboratory Tests", cost: 400, isAvailable: true },
      { name: "Surgery", cost: 50000, isAvailable: true }
    ],
    capacity: {
      totalBeds: 200,
      availableBeds: 50,
      icuBeds: 20,
      emergencyBeds: 10
    },
    operatingHours: {
      monday: { open: "07:00", close: "22:00", isOpen: true },
      tuesday: { open: "07:00", close: "22:00", isOpen: true },
      wednesday: { open: "07:00", close: "22:00", isOpen: true },
      thursday: { open: "07:00", close: "22:00", isOpen: true },
      friday: { open: "07:00", close: "22:00", isOpen: true },
      saturday: { open: "07:00", close: "20:00", isOpen: true },
      sunday: { open: "07:00", close: "20:00", isOpen: true }
    },
    emergencyServices: {
      isAvailable: true,
      responseTime: 10,
      specialties: ["Trauma", "Cardiac", "Neurology", "Pediatrics"]
    },
    insurance: [
      { provider: "Apollo Health Insurance", isAccepted: true },
      { provider: "Private Insurance", isAccepted: true },
      { provider: "Corporate Insurance", isAccepted: true }
    ],
    ratings: {
      overall: 4.8,
      cleanliness: 4.7,
      staff: 4.8,
      treatment: 4.9,
      totalReviews: 3200
    },
    isActive: true,
    verified: true
  },
  {
    name: "Care Hospitals",
    type: "private",
    address: {
      street: "MVP Colony",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      zipCode: "530017",
      country: "India"
    },
    contact: {
      phone: "+91 891 2525254",
      email: "info@carevizag.com",
      website: "http://carevizag.com",
      emergency: "+91 891 2525255"
    },
    coordinates: {
      latitude: 17.7200,
      longitude: 83.3100
    },
    departments: [
      { name: "Cardiology", isAvailable: true, description: "Comprehensive heart care" },
      { name: "Dermatology", isAvailable: true, description: "Skin care and treatment" },
      { name: "General Medicine", isAvailable: true, description: "General medical care" },
      { name: "Orthopedics", isAvailable: true, description: "Bone and joint care" },
      { name: "Pediatrics", isAvailable: true, description: "Child care and treatment" },
      { name: "Gynecology", isAvailable: true, description: "Women's health care" }
    ],
    facilities: [
      { name: "Emergency Care", isAvailable: true },
      { name: "ICU", isAvailable: true },
      { name: "Laboratory", isAvailable: true },
      { name: "Pharmacy", isAvailable: true },
      { name: "Radiology", isAvailable: true },
      { name: "Cafeteria", isAvailable: true }
    ],
    services: [
      { name: "General Consultation", cost: 400, isAvailable: true },
      { name: "Specialist Consultation", cost: 700, isAvailable: true },
      { name: "Laboratory Tests", cost: 350, isAvailable: true },
      { name: "Surgery", cost: 45000, isAvailable: true }
    ],
    capacity: {
      totalBeds: 150,
      availableBeds: 40,
      icuBeds: 15,
      emergencyBeds: 8
    },
    operatingHours: {
      monday: { open: "08:00", close: "21:00", isOpen: true },
      tuesday: { open: "08:00", close: "21:00", isOpen: true },
      wednesday: { open: "08:00", close: "21:00", isOpen: true },
      thursday: { open: "08:00", close: "21:00", isOpen: true },
      friday: { open: "08:00", close: "21:00", isOpen: true },
      saturday: { open: "08:00", close: "19:00", isOpen: true },
      sunday: { open: "08:00", close: "18:00", isOpen: true }
    },
    emergencyServices: {
      isAvailable: true,
      responseTime: 12,
      specialties: ["Trauma", "Cardiac", "General"]
    },
    insurance: [
      { provider: "Care Health Insurance", isAccepted: true },
      { provider: "Private Insurance", isAccepted: true },
      { provider: "Corporate Insurance", isAccepted: true }
    ],
    ratings: {
      overall: 4.7,
      cleanliness: 4.6,
      staff: 4.7,
      treatment: 4.8,
      totalReviews: 2100
    },
    isActive: true,
    verified: true
  },
  {
    name: "KIMS Hospital",
    type: "private",
    address: {
      street: "PM Palem",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      zipCode: "530041",
      country: "India"
    },
    contact: {
      phone: "+91 891 2525256",
      email: "info@kimsvizag.com",
      website: "http://kimsvizag.com",
      emergency: "+91 891 2525257"
    },
    coordinates: {
      latitude: 17.7300,
      longitude: 83.3200
    },
    departments: [
      { name: "Cardiology", isAvailable: true, description: "Advanced cardiac care" },
      { name: "Dermatology", isAvailable: true, description: "Skin care and treatment" },
      { name: "General Medicine", isAvailable: true, description: "General medical care" },
      { name: "Orthopedics", isAvailable: true, description: "Bone and joint care" },
      { name: "Neurology", isAvailable: true, description: "Brain and nerve care" },
      { name: "Oncology", isAvailable: true, description: "Cancer treatment" },
      { name: "Urology", isAvailable: true, description: "Urinary system care" }
    ],
    facilities: [
      { name: "Emergency Care", isAvailable: true },
      { name: "ICU", isAvailable: true },
      { name: "NICU", isAvailable: true },
      { name: "Blood Bank", isAvailable: true },
      { name: "Radiology", isAvailable: true },
      { name: "Pharmacy", isAvailable: true },
      { name: "Cafeteria", isAvailable: true },
      { name: "Parking", isAvailable: true }
    ],
    services: [
      { name: "General Consultation", cost: 600, isAvailable: true },
      { name: "Specialist Consultation", cost: 900, isAvailable: true },
      { name: "Laboratory Tests", cost: 450, isAvailable: true },
      { name: "Surgery", cost: 60000, isAvailable: true }
    ],
    capacity: {
      totalBeds: 250,
      availableBeds: 60,
      icuBeds: 25,
      emergencyBeds: 12
    },
    operatingHours: {
      monday: { open: "07:00", close: "22:00", isOpen: true },
      tuesday: { open: "07:00", close: "22:00", isOpen: true },
      wednesday: { open: "07:00", close: "22:00", isOpen: true },
      thursday: { open: "07:00", close: "22:00", isOpen: true },
      friday: { open: "07:00", close: "22:00", isOpen: true },
      saturday: { open: "07:00", close: "20:00", isOpen: true },
      sunday: { open: "07:00", close: "20:00", isOpen: true }
    },
    emergencyServices: {
      isAvailable: true,
      responseTime: 8,
      specialties: ["Trauma", "Cardiac", "Neurology", "Pediatrics"]
    },
    insurance: [
      { provider: "KIMS Health Insurance", isAccepted: true },
      { provider: "Private Insurance", isAccepted: true },
      { provider: "Corporate Insurance", isAccepted: true }
    ],
    ratings: {
      overall: 4.9,
      cleanliness: 4.8,
      staff: 4.9,
      treatment: 4.9,
      totalReviews: 2800
    },
    isActive: true,
    verified: true
  },
  {
    name: "Government General Hospital",
    type: "government",
    address: {
      street: "Asilmetta",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      zipCode: "530003",
      country: "India"
    },
    contact: {
      phone: "+91 891 2561154",
      email: "info@gghvizag.org",
      website: "http://gghvizag.org",
      emergency: "+91 891 2561155"
    },
    coordinates: {
      latitude: 17.7150,
      longitude: 83.3080
    },
    departments: [
      { name: "Cardiology", isAvailable: true, description: "Heart care and treatment" },
      { name: "Dermatology", isAvailable: true, description: "Skin care and treatment" },
      { name: "General Medicine", isAvailable: true, description: "General medical care" },
      { name: "Orthopedics", isAvailable: true, description: "Bone and joint care" },
      { name: "Pediatrics", isAvailable: true, description: "Child care and treatment" },
      { name: "Gynecology", isAvailable: true, description: "Women's health care" },
      { name: "Psychiatry", isAvailable: true, description: "Mental health care" }
    ],
    facilities: [
      { name: "Emergency Care", isAvailable: true },
      { name: "ICU", isAvailable: true },
      { name: "Trauma Center", isAvailable: true },
      { name: "Blood Bank", isAvailable: true },
      { name: "Radiology", isAvailable: true },
      { name: "Pharmacy", isAvailable: true },
      { name: "Laboratory", isAvailable: true }
    ],
    services: [
      { name: "General Consultation", cost: 50, isAvailable: true },
      { name: "Specialist Consultation", cost: 100, isAvailable: true },
      { name: "Emergency Care", cost: 200, isAvailable: true },
      { name: "Laboratory Tests", cost: 150, isAvailable: true }
    ],
    capacity: {
      totalBeds: 400,
      availableBeds: 120,
      icuBeds: 40,
      emergencyBeds: 18
    },
    operatingHours: {
      monday: { open: "08:00", close: "20:00", isOpen: true },
      tuesday: { open: "08:00", close: "20:00", isOpen: true },
      wednesday: { open: "08:00", close: "20:00", isOpen: true },
      thursday: { open: "08:00", close: "20:00", isOpen: true },
      friday: { open: "08:00", close: "20:00", isOpen: true },
      saturday: { open: "08:00", close: "18:00", isOpen: true },
      sunday: { open: "08:00", close: "16:00", isOpen: true }
    },
    emergencyServices: {
      isAvailable: true,
      responseTime: 18,
      specialties: ["Trauma", "Cardiac", "General", "Pediatrics"]
    },
    insurance: [
      { provider: "Government Health Scheme", isAccepted: true },
      { provider: "Private Insurance", isAccepted: true }
    ],
    ratings: {
      overall: 4.3,
      cleanliness: 4.1,
      staff: 4.4,
      treatment: 4.3,
      totalReviews: 1650
    },
    isActive: true,
    verified: true
  },
  {
    name: "Rainbow Children's Hospital",
    type: "private",
    address: {
      street: "MVP Colony",
      city: "Visakhapatnam",
      state: "Andhra Pradesh",
      zipCode: "530017",
      country: "India"
    },
    contact: {
      phone: "+91 891 2525258",
      email: "info@rainbowvizag.com",
      website: "http://rainbowvizag.com",
      emergency: "+91 891 2525259"
    },
    coordinates: {
      latitude: 17.7250,
      longitude: 83.3150
    },
    departments: [
      { name: "Pediatrics", isAvailable: true, description: "Child care and treatment" },
      { name: "Neonatology", isAvailable: true, description: "Newborn care" },
      { name: "Pediatric Surgery", isAvailable: true, description: "Child surgery" },
      { name: "Pediatric Cardiology", isAvailable: true, description: "Child heart care" },
      { name: "Pediatric Neurology", isAvailable: true, description: "Child brain care" },
      { name: "General Medicine", isAvailable: true, description: "General medical care" }
    ],
    facilities: [
      { name: "Emergency Care", isAvailable: true },
      { name: "NICU", isAvailable: true },
      { name: "PICU", isAvailable: true },
      { name: "Laboratory", isAvailable: true },
      { name: "Pharmacy", isAvailable: true },
      { name: "Radiology", isAvailable: true },
      { name: "Play Area", isAvailable: true }
    ],
    services: [
      { name: "General Consultation", cost: 300, isAvailable: true },
      { name: "Specialist Consultation", cost: 500, isAvailable: true },
      { name: "Laboratory Tests", cost: 250, isAvailable: true },
      { name: "Surgery", cost: 35000, isAvailable: true }
    ],
    capacity: {
      totalBeds: 100,
      availableBeds: 25,
      icuBeds: 15,
      emergencyBeds: 8
    },
    operatingHours: {
      monday: { open: "08:00", close: "21:00", isOpen: true },
      tuesday: { open: "08:00", close: "21:00", isOpen: true },
      wednesday: { open: "08:00", close: "21:00", isOpen: true },
      thursday: { open: "08:00", close: "21:00", isOpen: true },
      friday: { open: "08:00", close: "21:00", isOpen: true },
      saturday: { open: "08:00", close: "19:00", isOpen: true },
      sunday: { open: "08:00", close: "18:00", isOpen: true }
    },
    emergencyServices: {
      isAvailable: true,
      responseTime: 10,
      specialties: ["Pediatrics", "Neonatology", "General"]
    },
    insurance: [
      { provider: "Rainbow Health Insurance", isAccepted: true },
      { provider: "Private Insurance", isAccepted: true },
      { provider: "Corporate Insurance", isAccepted: true }
    ],
    ratings: {
      overall: 4.8,
      cleanliness: 4.9,
      staff: 4.8,
      treatment: 4.9,
      totalReviews: 1200
    },
    isActive: true,
    verified: true
  }
];

// Sample doctors data
const doctorsData = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@kgh.com",
    phone: "+91 9876543210",
    specialization: "Cardiology",
    department: "Cardiology",
    licenseNumber: "AP123456",
    experience: 15,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 2005
      },
      {
        degree: "MD Cardiology",
        institution: "AIIMS Delhi",
        year: 2010
      }
    ],
    certifications: [
      {
        name: "Fellowship in Interventional Cardiology",
        issuingAuthority: "American College of Cardiology",
        year: 2012
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 20 },
      tuesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 20 },
      wednesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 20 },
      thursday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 20 },
      friday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 20 },
      saturday: { isAvailable: true, startTime: "09:00", endTime: "14:00", maxPatients: 10 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 800,
    rating: {
      average: 4.7,
      totalReviews: 156
    },
    bio: "Experienced cardiologist with expertise in interventional cardiology and heart failure management.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  },
  {
    name: "Dr. Michael Chen",
    email: "michael.chen@kgh.com",
    phone: "+91 9876543211",
    specialization: "Dermatology",
    department: "Dermatology",
    licenseNumber: "AP123457",
    experience: 12,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 2008
      },
      {
        degree: "MD Dermatology",
        institution: "JIPMER Puducherry",
        year: 2013
      }
    ],
    certifications: [
      {
        name: "Fellowship in Cosmetic Dermatology",
        issuingAuthority: "Indian Association of Dermatologists",
        year: 2015
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "10:00", endTime: "18:00", maxPatients: 25 },
      tuesday: { isAvailable: true, startTime: "10:00", endTime: "18:00", maxPatients: 25 },
      wednesday: { isAvailable: true, startTime: "10:00", endTime: "18:00", maxPatients: 25 },
      thursday: { isAvailable: true, startTime: "10:00", endTime: "18:00", maxPatients: 25 },
      friday: { isAvailable: true, startTime: "10:00", endTime: "18:00", maxPatients: 25 },
      saturday: { isAvailable: true, startTime: "10:00", endTime: "15:00", maxPatients: 15 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 600,
    rating: {
      average: 4.5,
      totalReviews: 98
    },
    bio: "Specialized in treating various skin conditions and performing cosmetic procedures.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  },
  {
    name: "Dr. Robert Wilson",
    email: "robert.wilson@amc.com",
    phone: "+91 9876543212",
    specialization: "General Medicine",
    department: "General Medicine",
    licenseNumber: "AP123458",
    experience: 20,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 2000
      },
      {
        degree: "MD General Medicine",
        institution: "Andhra Medical College",
        year: 2005
      }
    ],
    certifications: [
      {
        name: "Diploma in Diabetology",
        issuingAuthority: "Research Society for Study of Diabetes in India",
        year: 2008
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 30 },
      tuesday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 30 },
      wednesday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 30 },
      thursday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 30 },
      friday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 30 },
      saturday: { isAvailable: true, startTime: "08:00", endTime: "12:00", maxPatients: 20 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 400,
    rating: {
      average: 4.6,
      totalReviews: 234
    },
    bio: "Experienced general physician with special interest in diabetes management and preventive care.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  },
  {
    name: "Dr. Emily Davis",
    email: "emily.davis@apollo.com",
    phone: "+91 9876543213",
    specialization: "Orthopedics",
    department: "Orthopedics",
    licenseNumber: "AP123459",
    experience: 18,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 2002
      },
      {
        degree: "MS Orthopedics",
        institution: "AIIMS Delhi",
        year: 2007
      }
    ],
    certifications: [
      {
        name: "Fellowship in Joint Replacement",
        issuingAuthority: "Indian Orthopedic Association",
        year: 2010
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 15 },
      tuesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 15 },
      wednesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 15 },
      thursday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 15 },
      friday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 15 },
      saturday: { isAvailable: true, startTime: "09:00", endTime: "14:00", maxPatients: 8 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 1200,
    rating: {
      average: 4.8,
      totalReviews: 187
    },
    bio: "Specialized in joint replacement surgeries and sports medicine with extensive experience in arthroscopic procedures.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@care.com",
    phone: "+91 9876543214",
    specialization: "Neurology",
    department: "Neurology",
    licenseNumber: "AP123460",
    experience: 16,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 2004
      },
      {
        degree: "MD Neurology",
        institution: "NIMHANS Bangalore",
        year: 2009
      }
    ],
    certifications: [
      {
        name: "Fellowship in Stroke Management",
        issuingAuthority: "Indian Academy of Neurology",
        year: 2011
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 18 },
      tuesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 18 },
      wednesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 18 },
      thursday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 18 },
      friday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 18 },
      saturday: { isAvailable: true, startTime: "09:00", endTime: "14:00", maxPatients: 10 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 1000,
    rating: {
      average: 4.7,
      totalReviews: 145
    },
    bio: "Specialized in neurological disorders, stroke management, and epilepsy treatment.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  },
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@kims.com",
    phone: "+91 9876543215",
    specialization: "Oncology",
    department: "Oncology",
    licenseNumber: "AP123461",
    experience: 22,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 1998
      },
      {
        degree: "MD Oncology",
        institution: "Tata Memorial Hospital",
        year: 2003
      }
    ],
    certifications: [
      {
        name: "Fellowship in Medical Oncology",
        issuingAuthority: "Indian Society of Medical and Pediatric Oncology",
        year: 2005
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 12 },
      tuesday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 12 },
      wednesday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 12 },
      thursday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 12 },
      friday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 12 },
      saturday: { isAvailable: true, startTime: "08:00", endTime: "12:00", maxPatients: 6 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 1500,
    rating: {
      average: 4.9,
      totalReviews: 89
    },
    bio: "Experienced oncologist specializing in cancer treatment and chemotherapy management.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  },
  {
    name: "Dr. Anjali Patel",
    email: "anjali.patel@rainbow.com",
    phone: "+91 9876543216",
    specialization: "Pediatrics",
    department: "Pediatrics",
    licenseNumber: "AP123462",
    experience: 14,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 2006
      },
      {
        degree: "MD Pediatrics",
        institution: "AIIMS Delhi",
        year: 2011
      }
    ],
    certifications: [
      {
        name: "Fellowship in Neonatology",
        issuingAuthority: "Indian Academy of Pediatrics",
        year: 2013
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 25 },
      tuesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 25 },
      wednesday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 25 },
      thursday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 25 },
      friday: { isAvailable: true, startTime: "09:00", endTime: "17:00", maxPatients: 25 },
      saturday: { isAvailable: true, startTime: "09:00", endTime: "14:00", maxPatients: 15 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 500,
    rating: {
      average: 4.8,
      totalReviews: 234
    },
    bio: "Specialized in pediatric care with expertise in newborn care and child development.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  },
  {
    name: "Dr. Sunita Reddy",
    email: "sunita.reddy@ggh.com",
    phone: "+91 9876543217",
    specialization: "Gynecology",
    department: "Gynecology",
    licenseNumber: "AP123463",
    experience: 19,
    education: [
      {
        degree: "MBBS",
        institution: "Andhra Medical College",
        year: 2001
      },
      {
        degree: "MS Obstetrics & Gynecology",
        institution: "Andhra Medical College",
        year: 2006
      }
    ],
    certifications: [
      {
        name: "Fellowship in High-Risk Pregnancy",
        issuingAuthority: "Federation of Obstetric and Gynecological Societies of India",
        year: 2008
      }
    ],
    availability: {
      monday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 20 },
      tuesday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 20 },
      wednesday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 20 },
      thursday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 20 },
      friday: { isAvailable: true, startTime: "08:00", endTime: "16:00", maxPatients: 20 },
      saturday: { isAvailable: true, startTime: "08:00", endTime: "12:00", maxPatients: 12 },
      sunday: { isAvailable: false, startTime: "", endTime: "", maxPatients: 0 }
    },
    consultationFee: 600,
    rating: {
      average: 4.6,
      totalReviews: 178
    },
    bio: "Experienced gynecologist specializing in women's health, pregnancy care, and gynecological surgeries.",
    languages: ["English", "Telugu", "Hindi"],
    isActive: true,
    verified: true
  }
];

// Seed function
const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health-hub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    console.log('Cleared existing data');

    // Insert hospitals
    const hospitals = await Hospital.insertMany(hospitalsData);
    console.log(`Inserted ${hospitals.length} hospitals`);

    // Insert doctors and associate with hospitals
    const doctorsWithHospitals = doctorsData.map((doctor, index) => ({
      ...doctor,
      hospital: hospitals[index % hospitals.length]._id
    }));

    const doctors = await Doctor.insertMany(doctorsWithHospitals);
    console.log(`Inserted ${doctors.length} doctors`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
