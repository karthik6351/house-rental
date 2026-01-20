# 🚀 Quick Start Guide

## Prerequisites Check
Before you begin, ensure you have:
- ✅ Node.js v18 or higher installed
- ✅ MongoDB installed and running locally (or a MongoDB Atlas connection string)
- ✅ A code editor (VS Code recommended)
- ❓ Google Maps API key (optional for development)

## Step-by-Step Setup

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
The project includes a `.env` file in `backend/` folder. Update if needed:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/house-rent
JWT_SECRET=house_rent_platform_super_secret_jwt_key_2026_commercial_grade_application
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Frontend (.env.local)
The project includes a `.env.local` file in `frontend/` folder. Update if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Start MongoDB  Ensure MongoDB is running:
```bash
# Windows (if installed as service)
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# OR
mongod
```

### 4. Start the Application

**Option A: Using Two Terminals (Recommended)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
You should see:
```
Ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Option B: Using VS Code (If you have it)**
- Open two integrated terminals in VS Code
- Follow Option A steps in each terminal

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### 6. Create Test Accounts

**Create an Owner Account:**
1. Click "Sign up"
2. Select "Owner" role (building icon)
3. Fill in details:
   - Name: Test Owner
   - Email: owner@test.com
   - Phone: 1234567890
   - Password: password
4. Click "Create Owner Account"

**Create a Tenant Account:**
1. Logout (or use incognito/private browsing)
2. Click "Sign up"
3. Select "Tenant" role (house icon)
4. Fill in details:
   - Name: Test Tenant
   - Email: tenant@test.com
   - Phone: 9876543210
   - Password: password
5. Click "Create Tenant Account"

## 🎯 Testing the Application

### As Owner:
1. Login as owner@test.com
2. You'll be redirected to Owner Dashboard
3. Click "+ Add New Property"
4. Fill property details:
   - Title: "Luxury 3BHK Apartment"
   - Description: "Beautiful apartment with modern amenities..."
   - Address: "123 Main St, Mumbai, Maharashtra"
   - Price: 50000
   - Area: 1500
   - Bedrooms: 3
   - Bathrooms: 2
   - Furnishing: Furnished
5. Upload 2-3 images
6. Click "Create Property"
7. Property should appear in your dashboard!

### As Tenant:
1. Login as tenant@test.com
2. You'll be redirected to Search page
3. Properties created by owners will be listed
4. Try filters:
   - Set Max Price: 100000
   - Bedrooms: 3
   - Click "Search Properties"
5. View property cards
6. Click "Contact Owner" to initiate chat

## 🐛 Troubleshooting

### MongoDB Connection Error
**Error:** `Error connecting to MongoDB`
**Solution:**
1. Ensure MongoDB is running
2. Check connection string in `backend/.env`
3. Try: `mongodb://localhost:27017/house-rent`

### Port Already in Use
**Error:** `Port 5000 is already in use`
**Solution:**
1. Change PORT in `backend/.env` to 5001
2. Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to `http://localhost:5001/api`
3. Update `NEXT_PUBLIC_SOCKET_URL` to `http://localhost:5001`

### Frontend Can't Connect to Backend
**Error:** Network error or CORS error
**Solution:**
1. Ensure backend is running (check Terminal 1)
2. Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Check browser console for specific error

### Images Not Showing
**Error:** Images uploaded but not displaying
**Solution:**
1. Check `backend/uploads/properties/` folder exists
2. Verify images were actually uploaded there
3. Check image URLs in browser network tab

### Token Expired Error
**Error:** `Token expired. Please login again`
**Solution:**
1. This is normal - tokens expire after 7 days
2. Just logout and login again
3. For development, you can increase expiry in `backend/controllers/authController.js`

## 📝 Next Steps

1. ✅ Test property creation with images
2. ✅ Test property search with filters
3. ✅ Test property editing
4. ✅ Test availability toggle
5. 🚧 Add Google Maps API key for location features
6. 🚧 Set up chat system (Socket.IO)
7. 🚧 Deploy to production

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: { /* Your primary color shades */ },
  secondary: { /* Your secondary color shades */ },
}
```

### Change Port
- Backend: Edit `PORT` in `backend/.env`
- Frontend: Edit next.config.js or use `PORT=3001 npm run dev`

## 📚 Available Scripts

### Backend
```bash
npm run dev      # Start with auto-reload
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Start production server
npm run lint     # Run ESLint
```

## ✅ Verification Checklist

Before considering the app ready:
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can create owner account
- [ ] Can create tenant account
- [ ] Owner can create property
- [ ] Owner can see properties in dashboard
- [ ] Tenant can see properties in search
- [ ] Filters work correctly
- [ ] Images display properly
- [ ] Can edit property
- [ ] Can delete property
- [ ] Can toggle availability
- [ ] Role-based access control works (tenant can't access owner routes)

## 🆘 Still Having Issues?

Check:
1. Node.js version: `node --version` (should be >= 18)
2. MongoDB status: `mongo` or `mongosh` to connect
3. Package installations completed successfully
4. No firewall blocking ports 3000 or 5000
5. Console errors in both terminal and browser

## 🎉 Success!

If you can:
- ✅ Create and view properties as owner
- ✅ Search and view properties as tenant
- ✅ Upload and see images
- ✅ Use filters successfully

Then you're all set! The application is working correctly! 🚀

---

**Need Help?** Check the STATUS.md file for current implementation status.
