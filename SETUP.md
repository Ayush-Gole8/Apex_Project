# APEX Setup Guide

## Quick Start

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Backend

1. Navigate to the `backend` folder
2. Open the `.env` file
3. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```

### 3. Start Development Servers

#### Option A - Using the startup script (Windows):
```bash
./start-dev.bat
```

#### Option B - Using the startup script (Mac/Linux):
```bash
chmod +x start-dev.sh
./start-dev.sh
```

#### Option C - Manual startup:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features to Test

1. **Landing Page**: Beautiful animated hero section
2. **Course Cards**: Click on any of the 6 engineering courses
3. **AI Chat**: Click the chat button and ask for a custom course like "React Hooks Tutorial"
4. **Course Generation**: Watch as AI creates a structured course with modules and resources

## Troubleshooting

### Common Issues:

1. **Port 3000 already in use**: Kill the process or use a different port
2. **API key not working**: Make sure you copied the full key without spaces
3. **CORS errors**: Ensure backend is running on port 5000

### Environment Setup:

Make sure your `.env` file in the backend folder looks like this:
```
MONGODB_URI=mongodb://localhost:27017/apex
GEMINI_API_KEY=your_actual_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

## Next Steps

1. Set up MongoDB if you want to persist user data
2. Customize the course templates in `server.js`
3. Add authentication features
4. Deploy to production

## API Endpoints

- `GET /api/courses` - Get predefined courses
- `GET /api/courses/:id` - Get specific course
- `POST /api/generate-course` - Generate AI course

Enjoy building with APEX! 🚀