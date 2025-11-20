# 🚀 Setting Up Your Gemini API Key

## Quick Setup (2 minutes)

### Step 1: Get Your API Key from the 1Password Link

You already have your Gemini API key in the 1Password link you shared:
**https://share.1password.com/s#94D-wPdw4grmVBufUZPV4VdLq4yAm_ZrJmIv_jkOZrw**

1. Open the 1Password link
2. Copy the Gemini API key

### Step 2: Add it to Your Backend

```bash
cd backend
echo "GEMINI_API_KEY=paste-your-key-here" > .env
echo "PORT=8000" >> .env
```

Replace `paste-your-key-here` with the actual key from 1Password.

### Step 3: Verify Setup

```bash
# Start the backend (from backend directory)
python3 -m uvicorn app.main:app --reload --port 8000
```

Then in another terminal:
```bash
# Test the API
curl http://localhost:8000/health
```

You should see:
```json
{
  "status": "healthy",
  "message": "All services operational",
  "gemini_configured": true
}
```

✅ If `gemini_configured: true` - you're ready to go!

## Why Gemini?

Google Gemini 1.5 Pro offers several advantages:

1. **🆓 Free Tier:** 60 requests per minute for free
2. **📚 Large Context:** 1M token context window (vs GPT-4's 128K)
3. **🎯 Great for Documents:** Excellent at understanding complex legal documents
4. **💰 Cost Effective:** Free tier is generous for development/testing
5. **🚀 Fast:** Competitive speed with OpenAI models

## Troubleshooting

### Issue: "Gemini API key not configured"

**Solution:**
```bash
cd backend
cat .env
```

Should show:
```
GEMINI_API_KEY=your-actual-key
PORT=8000
```

If file doesn't exist or is empty, create it:
```bash
echo "GEMINI_API_KEY=your-key-from-1password" > .env
echo "PORT=8000" >> .env
```

### Issue: "Invalid API key"

**Solution:**
- Make sure you copied the complete key from 1Password
- No extra spaces or quotes around the key
- Key should start with something like `AIza...`

### Issue: Rate limits

**Solution:**
- Free tier: 60 requests/minute
- If you hit limits, wait 60 seconds
- For production, consider upgrading to paid tier

## Testing Your Setup

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

Expected: `"gemini_configured": true`

### Test 2: Mock Analysis
```bash
curl -X POST http://localhost:8000/api/test-analysis
```

Expected: Returns mock compliance report

### Test 3: Real Analysis
```bash
curl -X POST http://localhost:8000/api/analyze-form-c \
  -F "file=@../c-forms/formca (1).pdf" \
  -F "issuer_name=Test Company"
```

Expected: Returns AI-generated compliance analysis

## What Changed from OpenAI?

All code has been updated to use Gemini:

✅ **Backend changes:**
- `requirements.txt` - Uses `google-generativeai` instead of `openai`
- `compliance_analyzer.py` - Uses Gemini API
- `main.py` - Checks for `GEMINI_API_KEY`
- All documentation updated

✅ **No frontend changes needed** - Works exactly the same!

✅ **Same features:**
- PDF extraction
- Compliance analysis
- Structured reports
- All Rule 201 checks

## Benefits of This Switch

1. **Free for your use case** - No API costs during hackathon
2. **Larger context** - Can handle bigger PDFs more effectively
3. **Same quality** - Excellent at legal document analysis
4. **Easy setup** - Just one environment variable

---

**Ready to go?** Just add your key to the `.env` file and you're all set! 🎉

