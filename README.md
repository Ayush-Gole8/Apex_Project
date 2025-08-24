# APEX - AI-Powered Course Generation Platform

A full-stack MERN application that generates personalized engineering courses using AI technology.

## Features

- **Landing Page**: Beautiful hero section with animated elements
- **Pre-defined Courses**: 6 engineering courses with detailed information
- **AI Course Generation**: Generate custom courses using Gemini AI
- **Interactive UI**: Smooth animations with GSAP and Framer Motion
- **Responsive Design**: Built with Tailwind CSS
- **Real-time Chat**: AI-powered course generation interface

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- GSAP
- React Router
- React Icons
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Google Generative AI (Gemini)
- CORS

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/apex
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini AI API key
- `JWT_SECRET`: JWT secret for authentication
- `PORT`: Server port (default: 5000)

## API Endpoints

- `GET /api/courses` - Get all predefined courses
- `GET /api/courses/:id` - Get specific course details
- `POST /api/generate-course` - Generate AI course from topic

## Getting Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Add it to your `.env` file

## Features Overview

### Landing Page
- Animated hero section with floating elements
- 6 predefined engineering course cards
- Interactive chat interface for AI course generation
- Responsive design with glass-morphism effects

### Course Details
- Detailed course information
- Module breakdown with expandable sections
- Progress tracking
- Interactive elements

### AI-Generated Courses
- Real-time course generation using Gemini AI
- Structured course content with modules
- Learning resources and external links
- Progress tracking with completion status

## Design Highlights

- **Dark Theme**: Modern dark interface with gradient accents
- **Animations**: Smooth GSAP and Framer Motion animations
- **Glass Morphism**: Translucent elements with backdrop blur
- **Responsive**: Mobile-first design approach
- **Interactive**: Hover effects and micro-interactions

## Project Structure

```
apex/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing.js
│   │   │   ├── CourseDetail.js
│   │   │   └── GeneratedCourse.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.