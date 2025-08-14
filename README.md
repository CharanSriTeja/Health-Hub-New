# Health Hub - Complete Healthcare Management System

A comprehensive healthcare management system that allows users to find hospitals, book appointments with doctors, manage health records, prescriptions, and lab reports.

## Features

### 🏥 Hospital Search & Booking
- **Location-based search**: Find nearby hospitals using GPS
- **Hospital filtering**: Filter by specialty, district, and type
- **Doctor listings**: View available doctors at each hospital
- **Appointment booking**: Book appointments with real-time slot availability
- **Distance calculation**: Hospitals sorted by distance from user location

### 📅 Appointment Management
- **Calendar view**: Visual calendar with appointment indicators
- **Real-time data**: Dynamic appointment statistics
- **Status tracking**: Track appointment status (scheduled, confirmed, completed, cancelled)
- **Appointment actions**: Cancel, reschedule, and rate appointments

### 📋 Health Records
- **Digital records**: Store and manage health records
- **CRUD operations**: Create, read, update, delete records
- **File sharing**: Share records with healthcare providers

### 💊 Prescription Management
- **Digital prescriptions**: Store and manage prescriptions
- **Medication tracking**: Track medications and dosages
- **Prescription history**: View complete prescription history

### 🧪 Lab Reports
- **Report upload**: Upload and store lab reports
- **Report viewing**: View and download reports
- **Report management**: Organize and categorize reports

## Technology Stack

### Frontend
- **React.js**: Modern UI framework
- **Framer Motion**: Smooth animations
- **Lucide React**: Icon library
- **React Calendar**: Calendar component
- **Axios**: HTTP client
- **React Hot Toast**: Notifications

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing

## Project Structure

```
Health-Hub-New/
├── health-hub/                 # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   └── ...
│   └── package.json
├── health-hub-server/          # Backend Node.js application
│   ├── controllers/           # Route controllers
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── scripts/              # Database scripts
│   └── server.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd health-hub-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `health-hub-server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/health-hub
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd health-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `health-hub` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/search-nearby` - Search nearby hospitals
- `GET /api/hospitals/:id` - Get hospital by ID

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/hospital/:hospitalId` - Get doctors by hospital
- `GET /api/doctors/:doctorId/available-slots` - Get available time slots

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get user appointments
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Health Records
- `POST /api/health-records` - Create health record
- `GET /api/health-records` - Get user health records
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions` - Get user prescriptions
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Lab Reports
- `POST /api/lab-reports` - Upload lab report
- `GET /api/lab-reports` - Get user lab reports
- `PUT /api/lab-reports/:id` - Update lab report
- `DELETE /api/lab-reports/:id` - Delete lab report

## Key Features Implementation

### Location-Based Hospital Search
- Uses browser geolocation API to get user coordinates
- Calculates distance between user and hospitals
- Sorts hospitals by distance
- Filters hospitals by specialty and location

### Real-Time Appointment Booking
- Fetches available time slots from doctor schedules
- Prevents double booking
- Updates calendar in real-time
- Sends confirmation notifications

### Dynamic Data Management
- All data is fetched from MongoDB database
- No static data - everything is dynamic
- Real-time updates across all components
- Proper error handling and loading states

## Database Models

### Hospital Model
- Basic information (name, type, address)
- Contact details and coordinates
- Departments and facilities
- Operating hours and ratings
- Emergency services

### Doctor Model
- Personal and professional information
- Specialization and experience
- Availability schedule
- Consultation fees and ratings
- Education and certifications

### Appointment Model
- Patient and doctor references
- Date, time, and duration
- Status tracking
- Notes and diagnosis
- Payment and insurance information

## Usage Guide

### For Users

1. **Register/Login**: Create an account or login to access the system
2. **Find Hospitals**: Use the hospital search to find nearby healthcare facilities
3. **Select Doctor**: Choose from available doctors at your preferred hospital
4. **Book Appointment**: Select available time slots and confirm booking
5. **Manage Records**: Upload and organize your health records, prescriptions, and lab reports

### For Developers

1. **API Integration**: Use the provided API endpoints for frontend-backend communication
2. **Database**: MongoDB with Mongoose ODM for data management
3. **Authentication**: JWT-based authentication system
4. **File Upload**: Multer middleware for handling file uploads
5. **Validation**: Express-validator for input validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the GitHub repository.

## Future Enhancements

- Video consultation integration
- Payment gateway integration
- Mobile app development
- AI-powered health recommendations
- Integration with wearable devices
- Telemedicine features
- Emergency services integration
