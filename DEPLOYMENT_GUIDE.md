# Form C Review Application - Deployment Guide

This guide will help you deploy the Form C Review Application in a new environment.

## 📦 Package Contents

The deployment package includes:

### Backend (Python/FastAPI)
- `/backend/` - Python backend application
  - `app/` - Main application code
    - `main.py` - FastAPI server
    - `compliance_analyzer.py` - AI integration (Gemini)
    - `pdf_extractor.py` - PDF processing
  - `requirements.txt` - Python dependencies
  - `.env` - Environment variables (needs configuration)

### Frontend (React/TypeScript)
- `/zen-garden/` - React frontend application
  - `src/` - Source code
    - `App.tsx` - Main application component
    - `services/api.ts` - Backend API integration
    - `utils/parseAIReport.ts` - AI report parser
  - `package.json` - Node.js dependencies
  - `vite.config.ts` - Vite configuration

### Documentation & Scripts
- `README.md` - Project overview
- `SETUP.md` - Detailed setup instructions
- `GEMINI_SETUP.md` - Gemini API setup guide
- `start-backend.sh` - Backend startup script
- `start-frontend.sh` - Frontend startup script
- `setup-gemini.sh` - Gemini API key setup helper

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or bun
- Gemini API key

### 1. Extract the Package
```bash
unzip form-c-review-app.zip
cd form-c-review-app
```

### 2. Backend Setup

#### Install Python dependencies:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Configure Gemini API:
Create a `.env` file in the `backend` directory:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Or use the setup script:
```bash
cd ..
./setup-gemini.sh
```

#### Start the backend:
```bash
./start-backend.sh
# Or manually:
cd backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup

#### Install Node.js dependencies:
```bash
cd zen-garden
npm install
# Or with bun:
bun install
```

#### Start the frontend:
```bash
cd ..
./start-frontend.sh
# Or manually:
cd zen-garden
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🔧 Configuration

### Backend Configuration
Edit `backend/.env`:
```env
# Required
GEMINI_API_KEY=your-api-key

# Optional
PORT=8000
HOST=0.0.0.0
```

### Frontend Configuration
The frontend is configured to connect to the backend at `http://localhost:8000`. 
To change this, edit `zen-garden/src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 📋 Environment Variables Checklist

### Backend (.env)
- [ ] `GEMINI_API_KEY` - Your Google Gemini API key

### Frontend
- No environment variables required (uses default localhost configuration)

## 🧪 Testing the Installation

### 1. Test Backend Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "All services operational",
  "gemini_configured": true
}
```

### 2. Test Frontend
1. Open http://localhost:5173
2. Click "Or Use Sample Data"
3. You should see sample compliance issues displayed

### 3. Test Full Integration
1. Upload a Form C PDF
2. Enter an issuer name
3. Click "Analyze Form C"
4. Wait for AI analysis (~15-30 seconds)
5. Review the compliance report

## 🐳 Docker Deployment (Optional)

### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile
Create `zen-garden/Dockerfile`:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Backend is configured to accept requests from localhost:5173
3. **File Uploads**: Limited to PDF files only
4. **Environment**: Use HTTPS in production

## 🆘 Troubleshooting

### Backend Issues

**ModuleNotFoundError**:
```bash
cd backend
pip install -r requirements.txt
```

**Gemini API Error**:
- Check your API key is valid
- Verify internet connectivity
- Check API quotas

### Frontend Issues

**Dependency Issues**:
```bash
cd zen-garden
rm -rf node_modules package-lock.json
npm install
```

**Build Errors**:
```bash
npm run build
```

### Common Issues

1. **Port Already in Use**:
   - Backend: Change port in `.env` or use `PORT=8001 ./start-backend.sh`
   - Frontend: `npm run dev -- --port 5174`

2. **CORS Errors**:
   - Ensure backend is running on port 8000
   - Check `API_BASE_URL` in frontend code

3. **PDF Processing Errors**:
   - Ensure PDF is valid and not corrupted
   - Check file size (recommended < 50MB)

## 📊 Performance Tips

1. **Backend**: Use production ASGI server
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Frontend**: Build for production
   ```bash
   npm run build
   npm run preview
   ```

## 🎉 Success!

Once everything is running:
1. Upload Form C documents
2. Get AI-powered compliance analysis in < 5 minutes
3. Review issues categorized by severity
4. Export reports for compliance teams

For additional help, refer to:
- `README.md` - Project overview
- `SETUP.md` - Detailed setup
- `TESTING.md` - Testing guide
