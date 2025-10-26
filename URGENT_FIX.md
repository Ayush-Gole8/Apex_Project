# 🚨 URGENT FIX REQUIRED - Render Deployment Issues

## ❌ Current Problems

1. **Gemini API Key Expired** - API key expired, courses cannot be generated
2. **Trust Proxy Warning** - Rate limiter misconfiguration (now fixed in code)

---

## ✅ SOLUTION: Update Gemini API Key in Render

### Step-by-Step Instructions:

### 1️⃣ Generate New Gemini API Key

1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"** button
4. Choose **"Create API key in new project"** (or use existing)
5. **Copy the entire API key** (starts with `AIza...`)

### 2️⃣ Update API Key in Render Backend

1. Go to: **https://dashboard.render.com**
2. Select your **backend web service** (e.g., `apex-backend`)
3. Click **"Environment"** in the left sidebar
4. Find the `GEMINI_API_KEY` variable
5. Click the **Edit** button (pencil icon)
6. **Paste your NEW API key**
7. Click **"Save Changes"**

### 3️⃣ Render Will Auto-Redeploy

- Render automatically redeploys when environment variables change
- Wait 2-3 minutes for deployment to complete
- Watch the **"Logs"** tab for deployment progress

### 4️⃣ Verify Deployment

Look for these success messages in Render Logs:
```
✅ Gemini AI initialized successfully
🚀 ApeX Server running on port 5000
📊 Environment: production
🤖 Gemini API: ✅ Configured
```

### 5️⃣ Test Your Website

1. Visit your frontend URL: `https://apex-fullstack.onrender.com`
2. Login with your credentials
3. Try generating a course (e.g., "React Hooks")
4. Course should generate successfully with AI content

---

## 🔧 Trust Proxy Issue (Already Fixed)

The rate limiter warning has been fixed in the latest code push. After your backend redeploys with the new API key, this warning will also disappear.

**What was fixed:**
- Added `app.set('trust proxy', 1);` to server configuration
- Added `trustProxy: true` to rate limiter options
- This allows proper IP detection behind Render's reverse proxy

---

## 🧪 Quick Test After Fix

Run these tests to confirm everything works:

### ✅ Test 1: Backend Health Check
```
Visit: https://your-backend-url.onrender.com/health

Expected Response:
{
  "status": "OK",
  "geminiAI": "Configured",
  "environment": "production"
}
```

### ✅ Test 2: Generate Course
1. Login to your frontend
2. Enter a topic (e.g., "Python basics")
3. Click "Generate Course"
4. Wait 10-30 seconds
5. Course should appear with AI-generated content

### ✅ Test 3: Quiz System
1. Scroll to bottom of generated course
2. Click "Take Quiz"
3. Quiz should load with 10 questions
4. Complete and submit
5. Results should display properly

---

## 📊 Monitoring Your Deployment

### Check Backend Logs in Render

1. Go to backend service dashboard
2. Click **"Logs"** tab
3. Look for these indicators:

**✅ Good Signs:**
```
✅ Gemini AI initialized successfully
🚀 ApeX Server running on port 5000
🤖 Gemini API: ✅ Configured
✅ Successfully used model: gemini-2.5-flash
```

**❌ Bad Signs (means API key still invalid):**
```
❌ Model gemini-2.5-flash failed
API key expired. Please renew the API key
[GoogleGenerativeAI Error]
```

---

## 🆘 If Still Having Issues

### Issue: "API key expired" still appearing

**Solution:**
1. Make sure you copied the ENTIRE API key (no spaces)
2. Verify you saved changes in Render environment variables
3. Wait for automatic redeployment to complete
4. Check if free tier quota is exceeded at: https://aistudio.google.com/app/apikey

### Issue: Rate limiter warnings persist

**Solution:**
1. Ensure latest code is deployed (check commit hash in Render)
2. Clear browser cache and refresh
3. Wait for cold start to complete (~30-60 seconds)

### Issue: Courses not generating

**Possible causes:**
1. API key not updated
2. Free tier quota exceeded (60 requests/minute)
3. Network connectivity issue
4. Rate limiter blocking requests

**Check:**
- Render logs for specific error messages
- Gemini API quota at: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com

---

## 💡 Important Notes

### Gemini API Free Tier Limits:
- **60 requests per minute**
- **1,500 requests per day**
- If exceeded, wait 24 hours or upgrade to paid tier

### API Key Best Practices:
- Rotate keys every 90 days
- Monitor usage in Google Cloud Console
- Keep keys secure (never commit to Git)
- Set up billing alerts if on paid tier

---

## ✨ Expected Behavior After Fix

Once you update the API key, your deployment should:

1. ✅ Generate courses using Gemini AI
2. ✅ Create quizzes for each course
3. ✅ No rate limiter warnings in logs
4. ✅ Proper error handling with fallback content
5. ✅ Fast response times (after cold start)

---

## 📞 Quick Reference

**Gemini API Console:** https://aistudio.google.com/app/apikey
**Render Dashboard:** https://dashboard.render.com
**Your Repository:** https://github.com/Ayush-Gole8/Apex_Project

**Environment Variables Required:**
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=<your_jwt_secret>
GEMINI_API_KEY=<your_new_gemini_key>
FRONTEND_URL=https://apex-fullstack.onrender.com
ALLOWED_ORIGINS=https://apex-fullstack.onrender.com
```

---

**Last Updated:** October 25, 2025  
**Priority:** 🔴 CRITICAL - Update API key immediately to restore functionality
