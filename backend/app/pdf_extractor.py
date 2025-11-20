"""
PDF Text Extraction Service for Form C documents
"""
import pdfplumber
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class PDFExtractor:
    """Extract text and data from Form C PDF documents"""
    
    def extract_text_from_pdf(self, pdf_path: str) -> Dict[str, any]:
        """
        Extract all text from a PDF file
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary containing extracted text and metadata
        """
        try:
            full_text = []
            page_texts = []
            
            with pdfplumber.open(pdf_path) as pdf:
                total_pages = len(pdf.pages)
                
                for page_num, page in enumerate(pdf.pages, start=1):
                    page_text = page.extract_text()
                    if page_text:
                        page_texts.append({
                            "page": page_num,
                            "text": page_text
                        })
                        full_text.append(f"--- Page {page_num} ---\n{page_text}")
                
                # Combine all text
                combined_text = "\n\n".join(full_text)
                
                return {
                    "success": True,
                    "total_pages": total_pages,
                    "full_text": combined_text,
                    "pages": page_texts,
                    "error": None
                }
                
        except Exception as e:
            logger.error(f"Error extracting PDF: {str(e)}")
            return {
                "success": False,
                "total_pages": 0,
                "full_text": "",
                "pages": [],
                "error": str(e)
            }
    
    def extract_tables_from_pdf(self, pdf_path: str) -> List[Dict]:
        """
        Extract tables from PDF (useful for financial data)
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            List of tables found in the document
        """
        try:
            tables = []
            
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    page_tables = page.extract_tables()
                    if page_tables:
                        for table_idx, table in enumerate(page_tables):
                            tables.append({
                                "page": page_num,
                                "table_index": table_idx,
                                "data": table
                            })
            
            return tables
            
        except Exception as e:
            logger.error(f"Error extracting tables: {str(e)}")
            return []

