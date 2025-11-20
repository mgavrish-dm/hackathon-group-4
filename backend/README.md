# Form C Review API Backend

AI-powered compliance review backend for SEC Form C documents using FastAPI and Google Gemini.

## Features

- 📄 PDF text extraction from Form C documents
- 🤖 AI-powered compliance analysis using Google Gemini 1.5 Pro
- ✅ Comprehensive Rule 201 compliance checking
- 🚀 Fast async API with FastAPI
- 🔒 Secure API key management

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
echo "GEMINI_API_KEY=your-key-here" > .env
echo "PORT=8000" >> .env
```

Get your Gemini API key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

Your `.env` file should contain:

```
GEMINI_API_KEY=your-actual-gemini-api-key-here
PORT=8000
```

### 3. Run the Server

```bash
# From the backend directory
python3 -m uvicorn app.main:app --reload --port 8000
```

Or use the simpler command from inside the app directory:

```bash
cd app
python3 main.py
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### Health Check

```bash
GET /health
```

Returns API status and configuration.

### Analyze Form C

```bash
POST /api/analyze-form-c
Content-Type: multipart/form-data

Fields:
- file: PDF file (Form C document)
- issuer_name: Name of the issuer company
```

**Example using curl:**

```bash
curl -X POST http://localhost:8000/api/analyze-form-c \
  -F "file=@path/to/form-c.pdf" \
  -F "issuer_name=Example Company Inc"
```

**Response:**

```json
{
  "success": true,
  "issuer_name": "Example Company Inc",
  "total_pages": 25,
  "raw_analysis": "Full compliance report text...",
  "structured_analysis": {
    "amendments": [...],
    "verifications": [...],
    "compliant_disclosures": [...],
    "key_personnel": [...]
  },
  "model_used": "gemini-1.5-pro",
  "error": null
}
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Architecture

```
backend/
├── app/
│   ├── main.py                  # FastAPI application & routes
│   ├── pdf_extractor.py         # PDF text extraction service
│   ├── compliance_analyzer.py   # AI compliance analysis service
│   └── __init__.py
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment template
├── .gitignore
└── README.md
```

## Development

### Testing the API

Test with a sample Form C:

```bash
# Using the test endpoint (returns mock data)
curl http://localhost:8000/api/test-analysis -X POST

# Using real analysis
curl -X POST http://localhost:8000/api/analyze-form-c \
  -F "file=@../c-forms/formca (1).pdf" \
  -F "issuer_name=Test Issuer"
```

## Compliance Checklist

The analyzer checks for all Rule 201 requirements:

1. ✅ Issuer Eligibility & Basic Data
2. ✅ Offering Summary Data
3. ✅ Business Description
4. ✅ Risk Factors
5. ✅ Directors & Officers
6. ✅ Beneficial Owners (20%+)
7. ✅ Ownership & Capital Structure
8. ✅ Financial Statements (proper level)
9. ✅ Financial Condition Discussion
10. ✅ Use of Proceeds
11. ✅ Related Party Transactions
12. ✅ Prior Offerings
13. ✅ Debt & Liabilities
14. ✅ Disqualification
15. ✅ Transaction Processing
16. ✅ Investor Limitations

## Troubleshooting

**Issue:** "Gemini API key not configured"
- **Solution:** Make sure `.env` file exists and contains `GEMINI_API_KEY=your-key`
- **Get API Key:** Visit https://aistudio.google.com/app/apikey

**Issue:** "Failed to extract PDF text"
- **Solution:** Ensure the PDF is not encrypted or corrupted

**Issue:** CORS errors from frontend
- **Solution:** Check that your frontend URL is in the `allow_origins` list in `main.py`

## Production Deployment

For production, consider:

1. Use a proper secrets manager for API keys
2. Add rate limiting
3. Implement authentication
4. Add request validation
5. Use a production ASGI server (Gunicorn + Uvicorn workers)
6. Add monitoring and logging
7. Implement caching for repeated analyses

## License

Internal use only for DealMaker Securities LLC hackathon project.

