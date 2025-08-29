# 🌲 ApeX Project - AI-Powered Learning Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.6-38B2AC.svg)](https://tailwindcss.com/)

**ApeX** is a modern AI-powered learning platform designed specifically for engineering students. Generate personalized courses on any topic instantly using advanced AI technology.

## ✨ Features

### 🎓 **AI Course Generation**
- **Instant Course Creation**: Generate comprehensive courses on any engineering topic
- **Structured Learning**: Organized modules with detailed content, key points, and exercises
- **Personalized Content**: Tailored to your learning level and preferences
- **Real-world Applications**: Practical examples and use cases

### 🎨 **Modern UI/UX**
- **Forest Academia Theme**: Professional green color scheme
- **Responsive Design**: Works perfectly on all devices
- **Smooth Animations**: GSAP and Framer Motion powered transitions
- **Professional Layout**: Clean, modern interface

### 🔐 **User Management**
- **Secure Authentication**: JWT-based login system
- **Personal Dashboard**: Track your learning progress
- **Course History**: Access all your generated courses
- **Progress Tracking**: Monitor completion and study time

### 📊 **Analytics & Progress**
- **Learning Statistics**: Detailed progress metrics
- **Completion Tracking**: Monitor course completion rates
- **Study Time**: Track time spent learning
- **Achievements**: Unlock badges and milestones

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ayush-Gole8/ApeX-Project.git
   cd ApeX-Project
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Set up Environment Variables**
   
   Create `.env` file in the backend directory:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Get your Gemini API key from: https://makersuite.google.com/app/apikey

5. **Start the Application**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
ApeX-Project/
├── frontend/                 # React frontend
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── ...
│   └── package.json
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── data/              # JSON data storage
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Advanced animations
- **GSAP** - Professional animations
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **OpenAI API** - AI course generation
- **File System** - JSON-based data storage

## 🎯 Core Features

### **AI Course Generation**
- Powered by Google's Gemini AI models
- Enhanced with RAG (Retrieval-Augmented Generation)
- Generates structured course content
- Includes modules, exercises, and assessments
- Real-world applications and examples

### **User Authentication**
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Session management

### **Data Management**
- File-based JSON storage
- User profiles and preferences
- Course history and progress
- Achievement tracking

## 🎨 Design System

### **Color Palette**
- **Primary**: Emerald Custom (`#10b981`)
- **Secondary**: Forest Green (`#22c55e`)
- **Accent**: Warm Orange (`#f97316`)
- **Background**: Dark Forest gradients
- **Text**: White with various opacities

### **Typography**
- **Primary Font**: Inter (Google Fonts)
- **Code Font**: JetBrains Mono
- **Font Weights**: 300-900 range
- **Professional hierarchy**

## 🔧 Development

### **Available Scripts**

**Frontend:**
```bash
npm start          # Start development server
npm build          # Build for production
npm test           # Run tests
```

**Backend:**
```bash
npm start          # Start server
npm run dev        # Start with nodemon
```

### **Environment Setup**
1. Copy `.env.example` to `.env`
2. Fill in your API keys and secrets
3. Update configuration as needed

## 🚀 Deployment

### **Single Service Deployment on Render (Recommended)**

#### **Complete Setup:**
1. **Stop any existing deployments** (frontend/backend services)
2. **Create New Web Service** on Render
3. **Connect GitHub** repository: `ApeX-Project`
4. **Configure Single Service:**

**Render Settings:**
```
Service Name: apex-fullstack
Environment: Node
Root Directory: [LEAVE BLANK]
Build Command: cd frontend && npm ci && npm run build && cd ../backend && npm ci
Start Command: cd backend && npm start
```

**Environment Variables:**
```
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

#### **Benefits of Single Deployment:**
- 🎯 **One URL** for everything (`https://apex-fullstack.onrender.com`)
- 🔒 **No CORS issues** (same domain)
- 💰 **Cost effective** (single service)
- 🛠️ **Easier management** and debugging
- ⚡ **Better performance** (no cross-domain requests)

#### **Local Development:**
```bash
# Install dependencies
npm run install-deps

# Start both frontend and backend
npm run dev

# Or separately:
cd backend && npm run dev
cd frontend && npm start
```

**Live Application:**
- **Frontend**: Root URL serves React app
- **API Endpoints**: `/api/*` routes
- **Health Check**: `/health`

### **Other Deployment Options**

**Frontend Deployment:**
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables

**Backend Deployment:**
1. Set up your server environment
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ayush Gole**
- GitHub: [@Ayush-Gole8](https://github.com/Ayush-Gole8)
- LinkedIn: [Ayush Gole](https://www.linkedin.com/in/ayush-gole8/)
- Email: ayushgole1910@gmail.com

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- React and Node.js communities
- All the open-source libraries used in this project

---

**Made with ❤️ by Ayush Gole • 2025**

# Apex Learning Platform

## Backend Connection Troubleshooting

If you're experiencing connection issues between the frontend and backend, follow these steps:

### Step 1: Start the backend server on port 3001

To ensure the backend server runs on the correct port (3001) which matches the frontend configuration:

1. Navigate to the backend directory
```
cd e:\Apex\backend
```

2. Run the server starter script
```
node start-server.js
```

Or simply double-click the `start-backend.bat` file in the backend folder.

### Step 2: Verify the backend is running

Open your browser and navigate to:
```
http://localhost:3001/api/ping
```

You should see a JSON response indicating the server is running.

### Step 3: Check your frontend configuration

The frontend is configured to connect to `http://localhost:3001` as specified in the `api.js` file.

If you need to use a different port, modify both:
- The PORT in the backend `.env` file
- The API_BASE_URL in the frontend `config/api.js` file

### Common Issues and Solutions

1. **Connection Refused Error**
   - Cause: Backend server isn't running or is running on a different port
   - Solution: Start the backend server using the instructions above

2. **API Endpoint Not Found**
   - Cause: Backend server is running but endpoints aren't available
   - Solution: Check server.js to ensure the required endpoints are defined

3. **CORS Errors**
   - Cause: Backend CORS settings don't allow frontend connection
   - Solution: Check CORS configuration in server.js

4. **Authentication Errors**
   - Cause: JWT token issues or missing authorization
   - Solution: Check token generation and validation in AuthContext.js and server.js

## Quick Setup for Development

1. Start backend:
```
cd backend
node start-server.js
```

2. Start frontend:
```
cd frontend
npm start
```

The application should now work correctly.