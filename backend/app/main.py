"""
Form C Review API - FastAPI Application
Provides endpoints for uploading and analyzing Form C documents
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import logging
import tempfile
import shutil
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

try:
    # Try importing as a package (when run with uvicorn or python -m)
    from app.pdf_extractor import PDFExtractor
    from app.compliance_analyzer import ComplianceAnalyzer
except ModuleNotFoundError:
    # If that fails, try relative imports (when run directly)
    from pdf_extractor import PDFExtractor
    from compliance_analyzer import ComplianceAnalyzer

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Form C Review API",
    description="AI-powered compliance review for SEC Form C documents",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",  # Alternative React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://*.app.github.dev",  # GitHub Codespaces
        "https://*.github.dev",      # GitHub Codespaces alternate
        "*",  # Allow all origins for Codespaces (temporary for testing)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
pdf_extractor = PDFExtractor()

# Lazy initialize compliance analyzer (needs API key)
_compliance_analyzer = None


def get_compliance_analyzer():
    """Get or create compliance analyzer instance"""
    global _compliance_analyzer
    if _compliance_analyzer is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="Gemini API key not configured. Please set GEMINI_API_KEY environment variable."
            )
        _compliance_analyzer = ComplianceAnalyzer(api_key=api_key)
    return _compliance_analyzer


# Response models
class HealthResponse(BaseModel):
    status: str
    message: str
    gemini_configured: bool


class AnalysisResponse(BaseModel):
    success: bool
    issuer_name: str
    total_pages: int
    raw_analysis: str
    structured_analysis: dict
    model_used: Optional[str] = None
    error: Optional[str] = None


@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    api_key_configured = bool(os.getenv("GEMINI_API_KEY"))
    
    return {
        "status": "ok",
        "message": "Form C Review API is running",
        "gemini_configured": api_key_configured
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check"""
    api_key_configured = bool(os.getenv("GEMINI_API_KEY"))
    
    return {
        "status": "healthy",
        "message": "All services operational",
        "gemini_configured": api_key_configured
    }


@app.post("/api/analyze-form-c")
async def analyze_form_c(
    file: UploadFile = File(...),
    issuer_name: str = Form(...)
):
    """
    Analyze a Form C PDF document for compliance
    
    Args:
        file: PDF file upload
        issuer_name: Name of the issuer
        
    Returns:
        Comprehensive compliance analysis
    """
    logger.info(f"Received Form C for analysis: {issuer_name}")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted"
        )
    
    # Create temporary file to save upload
    temp_file = None
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        logger.info(f"Saved PDF to temporary file: {temp_file_path}")
        
        # Extract text from PDF
        logger.info("Extracting text from PDF...")
        extraction_result = pdf_extractor.extract_text_from_pdf(temp_file_path)
        
        if not extraction_result["success"]:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to extract PDF text: {extraction_result['error']}"
            )
        
        logger.info(f"Successfully extracted {extraction_result['total_pages']} pages")
        
        # Analyze with AI
        logger.info("Starting AI compliance analysis...")
        analyzer = get_compliance_analyzer()
        analysis_result = analyzer.analyze_form_c(
            issuer_name=issuer_name,
            form_c_text=extraction_result["full_text"]
        )
        
        if not analysis_result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"AI analysis failed: {analysis_result['error']}"
            )
        
        logger.info(f"Analysis completed successfully for {issuer_name}")
        
        # Return combined results
        return JSONResponse(content={
            "success": True,
            "issuer_name": issuer_name,
            "total_pages": extraction_result["total_pages"],
            "raw_analysis": analysis_result["raw_analysis"],
            "structured_analysis": analysis_result["structured_analysis"],
            "model_used": analysis_result.get("model_used"),
            "error": None
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {e}")


@app.post("/api/test-analysis")
async def test_analysis():
    """
    Test endpoint that returns mock data similar to the frontend's current mock
    Useful for testing the frontend integration
    """
    return JSONResponse(content={
        "success": True,
        "issuer_name": "Test Company Inc.",
        "total_pages": 25,
        "raw_analysis": "This is a test analysis response...",
        "structured_analysis": {
            "amendments": [
                {
                    "issue": "Inconsistent max offering amount",
                    "rule": "Rule 201(a)",
                    "severity": "Critical",
                    "page": 3,
                    "summary": "Summary states $5M max; financial section shows $4.5M"
                }
            ],
            "verifications": [],
            "compliant_disclosures": [],
            "key_personnel": []
        },
        "model_used": "mock",
        "error": None
    })


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

