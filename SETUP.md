# Setup Instructions

## 🚀 Quick Setup Guide

Follow these steps to get the Form C Review Application running.

### Step 1: Configure Google Gemini API Key

You need a Google Gemini API key to use the AI analysis feature.

1. Get your API key from: **https://aistudio.google.com/app/apikey**
2. Create a file named `.env` in the `backend` folder:

```bash
cd backend
```

Create `.env` file with this content:
```
GEMINI_API_KEY=your-actual-gemini-api-key-here
PORT=8000
```

Replace `your-actual-gemini-api-key-here` with your real Gemini API key from the 1Password link you shared.

### Step 2: Verify Backend Dependencies

Dependencies should already be installed. Verify with:

```bash
cd backend
python3 -m pip show fastapi
```

If not installed, run:
```bash
pip3 install -r requirements.txt --user
```

### Step 3: Install Frontend Dependencies

```bash
cd zen-garden
npm install
# or
bun install
```

### Step 4: Start the Backend Server

Open a terminal window and run:

```bash
cd backend
python3 app/main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test the backend:** Open http://localhost:8000 in your browser. You should see:
```json
{
  "status": "ok",
  "message": "Form C Review API is running",
  "gemini_configured": true
}
```

### Step 5: Start the Frontend Server

Open a **new terminal window** and run:

```bash
cd zen-garden
npm run dev
# or
bun run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 6: Open the Application

Open your browser and navigate to: **http://localhost:5173**

You should see the DealMaker Form C Review interface!

## 🧪 Test the Application

### Option 1: Use Sample Data

1. Click the "Or Use Sample Data" button
2. You'll see a mock compliance report with example issues

### Option 2: Upload a Real Form C

1. Enter an issuer name (e.g., "Test Company Inc")
2. Drag and drop or click to upload a PDF from the `c-forms` folder
3. Click "Analyze Form C"
4. Wait 15-30 seconds for AI analysis
5. Review the comprehensive compliance report!

## 🔧 Troubleshooting

### Backend won't start

**Issue:** `ModuleNotFoundError: No module named 'fastapi'`
**Solution:** 
```bash
cd backend
pip3 install -r requirements.txt --user
```

**Issue:** `Gemini API key not configured`
**Solution:** 
- Ensure `.env` file exists in the `backend` directory
- Check that it contains: `GEMINI_API_KEY=your-key-here`
- Get your key from: https://aistudio.google.com/app/apikey

### Frontend won't start

**Issue:** `Cannot find module` or dependency errors
**Solution:**
```bash
cd zen-garden
rm -rf node_modules package-lock.json
npm install
```

### Can't analyze PDFs

**Issue:** "Failed to connect to backend"
**Solution:**
- Ensure backend is running on http://localhost:8000
- Check the terminal for backend logs
- Verify no firewall is blocking port 8000

**Issue:** Analysis takes forever
**Solution:**
- Large PDFs (50+ pages) can take 30-60 seconds
- Check backend terminal for progress logs
- Ensure your Gemini API key is valid and active

### CORS Errors

**Issue:** Browser shows CORS policy errors
**Solution:**
- Ensure backend is running
- Frontend should be on http://localhost:5173
- Check `app/main.py` has correct CORS origins

## 📊 API Testing (Advanced)

You can test the backend API directly:

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Test analysis (mock data)
curl -X POST http://localhost:8000/api/test-analysis

# Real analysis
curl -X POST http://localhost:8000/api/analyze-form-c \
  -F "file=@c-forms/formca (1).pdf" \
  -F "issuer_name=Test Company"
```

### Using Swagger UI
Visit: http://localhost:8000/docs

Interactive API documentation where you can test all endpoints.

## 💡 Tips

1. **Large PDFs:** The bigger the PDF, the longer the analysis takes. Be patient!
2. **API Costs:** Gemini API is free for moderate usage (60 requests/minute)
3. **Mock Data:** Use sample data to test the UI without using API credits
4. **Logs:** Check terminal output for detailed error messages
5. **Browser:** Use Chrome or Firefox for best experience

## 🎯 Next Steps

Once everything is working:

1. Try uploading different Form Cs from the `c-forms` folder
2. Test with intentionally incorrect forms from `c-forms-issues` folder
3. Review the AI-generated compliance reports
4. Export reports for further review

## 📞 Need Help?

Check the logs in both terminal windows for detailed error messages. Most issues are related to:
- Missing OpenAI API key
- Backend not running
- Port conflicts (something else using port 8000 or 5173)

---

**Ready to go?** Start with Step 1 above! 🚀

