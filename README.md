# SwiftParcel - Parcel Delivery Web Application

SwiftParcel is a production-ready, full-stack parcel delivery application built with the MERN stack (MongoDB, Express, React, Node.js).

## 🚀 Tech Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe Integration (Test Mode)

## 📁 Project Structure
```
/server
  /config      # Database connection
  /controllers # API logic
  /middleware  # Auth & Admin guards
  /models      # MongoDB schemas
  /routes      # API endpoints
  /utils       # Pricing logic

/client
  /src
    /components # Reusable UI
    /context    # Global Auth state
    /pages      # Dashboard, Login, etc.
```

## ⚙️ Setup Instructions

### Backend Setup
1. Open terminal in `/server`
2. Run `npm install`
3. Update `.env` with your MongoDB URI and Stripe Secret Key
4. Run `node server.js` (or `npm start`)

### Frontend Setup
1. Open terminal in `/client`
2. Run `npm install`
3. Update `PaymentModal.jsx` with your Stripe Publishable Key
4. Run `npm run dev`

## 🔐 Security Features
- Password hashing with Bcrypt
- JWT-based authentication
- Protected routes (User vs Admin)
- Secure API endpoints

## 🚚 Features
- **Customer Dashboard**: Create parcels, track status, and pay via Stripe.
- **Admin Dashboard**: Manage users and update delivery status.
- **Dynamic Pricing**: Weight and delivery-type based cost calculation.
- **Modern UI**: Clean, responsive design with Tailwind CSS and glassmorphism.
