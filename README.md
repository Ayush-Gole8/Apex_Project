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
   OPENAI_API_KEY=your_openai_api_key_here
   ```

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
- Powered by OpenAI's GPT models
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

### **Frontend Deployment**
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables

### **Backend Deployment**
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