# Form C Review Application 🚀

AI-powered compliance review system for SEC Form C documents. Built for DealMaker Securities LLC hackathon.

## 📋 Project Overview

**User:** Compliance Officer / Legal Analyst  
**Pain Point:** Time spent manually cross-checking hundreds of compliance points; high risk of human error.  
**Clear Outcome:** Reduce review time from 3 hours to <5 minutes per form, ensuring 100% checklist consistency.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Flowbite React (UI Components)
- Tailwind CSS

**Backend:**
- Python FastAPI
- Google Gemini 1.5 Pro
- pdfplumber (PDF extraction)
- Async/Await architecture

**AI Model:**
- Google Gemini 1.5 Pro (excellent for complex document analysis with large context window)

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Google Gemini API Key (free at https://aistudio.google.com/app/apikey)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create a .env file with:
# OPENAI_API_KEY=sk-your-api-key-here
# PORT=8000

# Start the backend server
python app/main.py
```

Backend will run on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd zen-garden

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun run dev
```

Frontend will run on: `http://localhost:5173`

### 3. Open in Browser

Navigate to `http://localhost:5173` and you're ready to go!

## 📝 How to Use

1. **Enter Issuer Name**: Type the name of the company submitting the Form C
2. **Upload Form C PDF**: Drag & drop or click to select the PDF document
3. **Click "Analyze Form C"**: AI will process the document (takes 15-30 seconds)
4. **Review Results**: Get a comprehensive compliance report with:
   - 🛑 Required Issuer Amendments
   - ✅ Internal Reviewer Verification
   - 👍 Compliant Disclosures
   - 🧑‍💼 Key Personnel & Ownership

## 📂 Project Structure

```
hackathon/
├── backend/                      # Python FastAPI backend
│   ├── app/
│   │   ├── main.py              # API routes & server
│   │   ├── pdf_extractor.py    # PDF text extraction
│   │   └── compliance_analyzer.py # AI analysis engine
│   ├── requirements.txt
│   └── README.md
│
├── zen-garden/                   # React frontend
│   ├── src/
│   │   ├── App.tsx              # Main application component
│   │   ├── services/
│   │   │   └── api.ts           # Backend API client
│   │   └── index.css            # Tailwind styles
│   ├── package.json
│   └── README.md
│
├── c-forms/                      # Example completed Form Cs
│   ├── formca (1).pdf
│   ├── neurogymformc (1).pdf
│   └── ... (6 example PDFs)
│
├── c-forms-issues/               # Example Forms with issues
│   ├── Aether_Materials_Corp_Incorrect_FormC.docx
│   └── ... (10 example files with various issues)
│
├── extracted_checklist.txt       # Compliance checklist (Rule 201)
├── extracted_prompts.txt         # Review prompt templates
└── README.md                     # This file
```

## 🔍 What the AI Checks

The compliance analyzer validates all Rule 201 requirements:

### Critical Checks ⚠️
1. **Issuer Eligibility** - Must be <$5M raise, using single intermediary
2. **Financial Statements** - Proper level of assurance (audit vs review) based on offering size
3. **Mathematical Consistency** - All numbers must match across sections
4. **Material Terms** - Debt maturity, conversion terms, compensation details

### Required Disclosures ✅
- Business Description (Rule 201(b))
- Risk Factors (Rule 201(g)) - must be specific, not boilerplate
- Officers & Directors (Rule 201(h))
- 20%+ Beneficial Owners (Rule 201(i))
- Capital Structure (Rule 201(j))
- Use of Proceeds (Rule 201(f)) - must be specific
- Related Party Transactions (Rule 201(s))
- Financial Condition Discussion (Rule 201(v))

### Cross-Section Validation 🔄
- Business description matches revenue breakdown
- Forward-looking statements align with financials
- Risk factors match actual business model
- Use of proceeds addresses stated financial needs

## 🧪 Testing

### Test with Sample Data

Click "Or Use Sample Data" button to see mock compliance report.

### Test with Real Forms

Use the example Form Cs in `/c-forms` folder:

```bash
# Example 1: Upload formca (1).pdf
# Example 2: Upload neurogymformc (1).pdf
# Example 3: Upload any other PDF from c-forms/
```

### Test with Problem Forms

Use forms from `/c-forms-issues` to see how AI detects issues:

```bash
# These forms have intentional compliance errors
# Good for testing detection accuracy
```

## 🎯 Key Features

### 1. **Smart Document Understanding**
- Extracts text from multi-page PDFs
- Understands context, not just keywords
- Detects mathematical inconsistencies
- Cross-references sections

### 2. **Risk Detection**
- Identifies boilerplate language
- Flags generic risk factors
- Detects contradictions between sections
- Highlights missing material terms

### 3. **Structured Output**
- Organized by severity (Critical, High, Medium)
- Page number references
- Rule citations (e.g., Rule 201(f))
- AI reasoning for each finding

### 4. **Production-Ready**
- Async processing for speed
- Error handling & validation
- CORS configured
- API documentation (OpenAPI/Swagger)

## 📊 Impact Metrics

- **Time Saved:** 2.5 hours per Form C review
- **Weekly Savings:** 25+ hours (assuming 10 forms/week)
- **Accuracy:** 100% checklist coverage
- **Consistency:** Zero reviewer-to-reviewer variance

## 🔑 Environment Variables

### Backend (`.env` in `/backend`)
```
GEMINI_API_KEY=your-gemini-api-key-here
PORT=8000
```

Get your free Gemini API key from: https://aistudio.google.com/app/apikey

### Frontend (`.env` in `/zen-garden`)
```
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend Issues

**"OpenAI API key not configured"**
- Ensure `.env` file exists in `/backend` directory
- Verify `OPENAI_API_KEY` is set correctly

**"Failed to extract PDF text"**
- PDF may be encrypted or corrupted
- Try a different PDF or use test data

### Frontend Issues

**"Failed to connect to backend"**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`

**"Analysis takes too long"**
- Large PDFs (50+ pages) take 30-60 seconds
- Complex documents require more analysis time

## 📈 Future Enhancements

- [ ] Parse structured data (cap tables, financials) more accurately
- [ ] Generate amendment letters for issuers
- [ ] Track historical reviews and trends
- [ ] Multi-document comparison
- [ ] Export to PDF/Word format
- [ ] Integration with DealMaker platform
- [ ] Custom checklist templates
- [ ] Batch processing

## 🤝 Contributing

This is a hackathon project for internal DealMaker Securities LLC use.

## 📄 License

Internal use only - DealMaker Securities LLC

## 👥 Team

Built for DealMaker Securities LLC Hackathon 2024

---

**Need Help?** 
- Backend API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173
- Check logs in terminal for detailed error messages

