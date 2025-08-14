# Health Hub Backend Server

A comprehensive backend API for the Health Hub application, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for patients, doctors, and admins
- **Appointment Management**: Schedule, manage, and track medical appointments
- **Health Records**: Comprehensive health record management system
- **Prescriptions**: Digital prescription management
- **Lab Reports**: Laboratory test result management
- **Hospital Management**: Hospital information and search functionality
- **Security**: Input validation, rate limiting, CORS, and security headers
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: bcryptjs, helmet, cors
- **File Upload**: Multer
- **Logging**: Morgan

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-hub-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/health-hub

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Project Structure

```
health-hub-server/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   ├── authController.js    # Authentication controller
│   ├── userController.js    # User management controller
│   └── appointmentController.js # Appointment controller
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation middleware
├── models/
│   ├── User.js             # User model
│   ├── Appointment.js      # Appointment model
│   ├── Hospital.js         # Hospital model
│   ├── HealthRecord.js     # Health record model
│   ├── Prescription.js     # Prescription model
│   └── LabReport.js        # Lab report model
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── userRoutes.js       # User routes
│   ├── appointmentRoutes.js # Appointment routes
│   ├── healthRecordRoutes.js # Health record routes
│   ├── prescriptionRoutes.js # Prescription routes
│   ├── labReportRoutes.js  # Lab report routes
│   └── hospitalRoutes.js   # Hospital routes
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/stats` - Get user statistics (Admin only)
- `GET /api/users/doctors` - Get all doctors
- `GET /api/users/patients` - Get all patients (Doctors & Admins)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `PUT /api/users/:id/status` - Activate/Deactivate user (Admin only)

### Appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/stats` - Get appointment statistics
- `GET /api/appointments/available-slots` - Get available time slots
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Health Records
- `POST /api/health-records` - Create new health record
- `GET /api/health-records` - Get all health records
- `GET /api/health-records/:id` - Get health record by ID
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record

### Prescriptions
- `POST /api/prescriptions` - Create new prescription
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Lab Reports
- `POST /api/lab-reports` - Create new lab report
- `GET /api/lab-reports` - Get all lab reports
- `GET /api/lab-reports/:id` - Get lab report by ID
- `PUT /api/lab-reports/:id` - Update lab report
- `DELETE /api/lab-reports/:id` - Delete lab report

### Hospitals
- `POST /api/hospitals` - Create new hospital (Admin only)
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/nearby` - Search nearby hospitals
- `GET /api/hospitals/:id` - Get hospital by ID
- `PUT /api/hospitals/:id` - Update hospital (Admin only)
- `DELETE /api/hospitals/:id` - Delete hospital (Admin only)

## Database Models

### User Model
- Personal information (name, email, phone, DOB, gender, blood group)
- Address and emergency contact
- Medical history (allergies, conditions, medications, surgeries)
- Role-based access (patient, doctor, admin)
- Profile picture and account status

### Appointment Model
- Patient, doctor, and hospital references
- Appointment date, time, and duration
- Department and appointment type
- Status tracking (scheduled, confirmed, completed, etc.)
- Notes, diagnosis, and follow-up information
- Cost and payment status

### Hospital Model
- Hospital information (name, type, address, contact)
- Departments and facilities
- Operating hours and emergency services
- Capacity and ratings
- Insurance acceptance

### Health Record Model
- Various record types (vital signs, lab results, imaging, etc.)
- Comprehensive medical data
- Provider information
- Attachments and sharing capabilities

### Prescription Model
- Medication details (name, dosage, frequency, duration)
- Doctor and patient information
- Diagnosis and instructions
- Cost and insurance information

### Lab Report Model
- Test results and normal ranges
- Laboratory and specimen information
- Quality control and digital signatures
- Cost and insurance details

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet for security headers
- **Role-based Access**: Different permissions for different user roles

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database errors
- Generic server errors with appropriate HTTP status codes

## Development

### Scripts
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run tests (to be implemented)

### Adding New Features
1. Create the model in the `models/` directory
2. Create the controller in the `controllers/` directory
3. Create the routes in the `routes/` directory
4. Add validation rules in `middleware/validation.js`
5. Update the main server file to include new routes

## Deployment

### Environment Variables
Make sure to set the following environment variables in production:
- `NODE_ENV=production`
- `MONGODB_URI` - Your production MongoDB connection string
- `JWT_SECRET` - A strong secret key for JWT signing
- `JWT_REFRESH_SECRET` - A strong secret key for refresh tokens
- `FRONTEND_URL` - Your frontend application URL

### Security Considerations
- Use strong, unique JWT secrets
- Enable HTTPS in production
- Set up proper CORS configuration
- Implement proper logging and monitoring
- Regular security updates and patches

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
