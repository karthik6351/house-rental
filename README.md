# House Rental Platform

A commercial-grade house rental platform connecting property owners with tenants. Built with strict quality standards and zero-error policy.

## 🚀 Features

### For Property Owners
- ✅ Secure authentication with role-based access
- ✅ Property management (Create, Edit, Delete)
- ✅ Multiple image uploads per property
- ✅ Toggle availability status
- ✅ Location-based property listing
- ✅ Real-time chat with tenants
- ✅ Dashboard with property statistics

### For Tenants
- ✅ Location-based property search
- ✅ Radius filtering
- ✅ Price, bedrooms, bathrooms, furnishing filters
- ✅ Google Maps integration
- ✅ Property details view
- ✅ Real-time chat with owners

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO for real-time chat
- Multer for file uploads
- Google Maps Geocoding API
- bcryptjs for password hashing

### Frontend
- Next.js 14 (App Router)
- React  18
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Axios for HTTP requests
- Google Maps JavaScript API

## 📋 Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- Google Maps API Key (optional for development)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd house-rent
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment example
copy .env.example .env

# Edit .env and add your configurations:
# - MongoDB connection string
# - JWT secret
# - Google Maps API key (optional)
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

## 🚀 Running the Application

### Start MongoDB
Make sure MongoDB is running on your system.

### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## 🔐 Default Test Accounts

Create these accounts after starting the application:

**Owner Account:**
- Email: owner@test.com
- Password: password
- Role: Owner

**Tenant Account:**
- Email: tenant@test.com
- Password: password
- Role: Tenant

## 📁 Project Structure

```
house-rent/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   └── chatController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── properties.js
│   │   └── chat.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── login/
    │   ├── register/
    │   ├── owner/
    │   │   ├── dashboard/
    │   │   ├── properties/
    │   │   └── messages/
    │   └── tenant/
    │       ├── search/
    │       └── messages/
    ├── components/
    ├── contexts/
    ├── lib/
    ├── .env.local
    └── package.json
```

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Owner/Tenant)
- ✅ Protected API routes
- ✅ Input validation on both frontend and backend
- ✅ CORS configuration
- ✅ Secure file upload handling

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Properties (Owner)
- `POST /api/properties` - Create property
- `GET /api/properties/my-properties` - Get owner's properties
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `PATCH /api/properties/:id/availability` - Toggle availability

### Properties (Tenant)
- `GET /api/properties/search` - Search properties

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/messages/:propertyId/:otherUserId` - Get messages
- `POST /api/chat/messages` - Send message

## 🎨 Design Features

- Premium glassmorphism UI
- Dark mode support
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)
- Custom color palette
- Professional typography (Inter font)
- Micro-interactions
- Loading states

## 📱 Cross-Platform Testing

Tested on:
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Responsive breakpoints (320px - 2560px)

## 🧪 Testing Checklist

- [x] Owner registration and login
- [x] Tenant registration and login
- [x] Property creation with images
- [x] Property editing
- [x] Property deletion
- [x] Availability toggle
- [x] Location-based search
- [x] Filter combinations
- [x] Real-time chat
- [x] Role-based access control
- [x] Token expiration handling

## 🚧 Known Limitations

- Google Maps API key needed for full geocoding functionality
- Default coordinates (0,0) used if API key not configured
- Chat notifications require Socket.IO connection

## 📝 Future Enhancements

- Email verification
- Password reset
- Property reviews/ratings
- Booking/reservation system
- Payment integration
- Admin dashboard
- Push notifications
- Advanced analytics

## 🤝 Contributing

This is a commercial project. Contributions are welcome with proper testing and documentation.

## 📄 License

Proprietary - All rights reserved

## 💬 Support

For support, please contact the development team.

---

**Built with ❤️ for commercial deployment**

**Quality Target: $6,300 Commercial Product**
