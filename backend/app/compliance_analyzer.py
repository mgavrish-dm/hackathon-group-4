"""
AI-Powered Compliance Analysis Service
Uses Google Gemini to analyze Form C against compliance checklist
"""
import google.generativeai as genai
from typing import Dict, List
import os
import logging

logger = logging.getLogger(__name__)


# Compliance Checklist based on Rule 201 requirements
COMPLIANCE_CHECKLIST = """
FORM C COMPLIANCE CHECKLIST (Rule 201 - Regulation Crowdfunding)

The issuer must provide the following disclosures:

1. ISSUER ELIGIBILITY & BASIC DATA (Rule 201(a), (b)):
   - Issuer name and legal status
   - Form of organization, jurisdiction, date of organization
   - Physical address and website
   - Intermediary information (must be DealMaker Securities LLC)
   - Intermediary compensation details

2. OFFERING SUMMARY DATA (Rule 201(c)):
   - Type of security offered
   - Target number of securities and price
   - Target offering amount and maximum offering amount
   - Oversubscription handling (if applicable)
   - Offering deadline and terms
   - Current number of employees

3. BUSINESS DESCRIPTION (Rule 201(b)):
   - Description of business and business plan
   - Must be specific and not generic

4. RISK FACTORS (Rule 201(g)):
   - Material factors that make investment speculative or risky
   - Must be specific to the issuer, not boilerplate
   - Should address industry-specific risks
   - Must be consistent with business description

5. DIRECTORS & OFFICERS (Rule 201(h)):
   - Names of all directors and officers
   - Positions held and duration
   - Business experience for past 3 years

6. BENEFICIAL OWNERS (Rule 201(i)):
   - 20%+ owners (voting equity)
   - Calculated on basis of voting power

7. OWNERSHIP & CAPITAL STRUCTURE (Rule 201(j)):
   - Terms of securities being offered
   - Description of each class of security
   - Voting rights and limitations
   - How rights may be diluted

8. FINANCIAL STATEMENTS (Rule 201(t)):
   - $0-$124k: Tax returns + CEO certified statements
   - $124k-$618k: CPA reviewed financial statements
   - $618k+: CPA audited financial statements (first-time issuers up to $1.235M can use reviewed)

9. FINANCIAL CONDITION DISCUSSION (Rule 201(v)):
   - Liquidity, capital resources
   - Historical results of operations

10. USE OF PROCEEDS (Rule 201(f)):
    - Specific purpose and intended use
    - Must provide detail, not vague "general corporate purposes"
    - If accepting oversubscriptions, explain use of excess

11. RELATED PARTY TRANSACTIONS (Rule 201(s)):
    - Transactions >5% of capital raised
    - Must disclose all material terms

12. PRIOR OFFERINGS (Rule 201(e)):
    - Exempt offerings in past 3 years
    - Date, exemption used, securities type, amount

13. DEBT & LIABILITIES (Rule 201(u)):
    - Material indebtedness terms
    - Amount, interest rate, maturity date

14. DISQUALIFICATION (Rule 227.503):
    - Bad actor disclosure
    - Pre-2016 triggering events

15. TRANSACTION PROCESSING (Rule 201(w)):
    - Investment confirmation process
    - Cancellation rights (48 hours)
    - Material changes policy
    - Rolling/early closings

16. INVESTOR LIMITATIONS (Rule 100):
    - Clear disclosure of investment limits

CRITICAL INCONSISTENCIES TO FLAG:
- Conflicting amounts across sections (offering amount, valuation, financials)
- Dates that don't align (fiscal year, offering deadline, etc.)
- Mathematical errors (cap table, revenue sums, percentages)
- Contradictions between sections (business model vs. revenue breakdown)
"""


REVIEW_PROMPT_TEMPLATE = """
You are an expert compliance analyst for DealMaker Securities LLC reviewing a Form C submission for Regulation Crowdfunding.

Your task is to analyze the provided Form C document and generate a comprehensive compliance report following this exact structure:

**REPORT STRUCTURE:**

**I. 🛑 Required Issuer Amendments (External Actions)**
Focus on material disclosure deficiencies that must be corrected. Organize by category:
- General Issues
- Risk Factor Issues
- Financial Consistency & Math Validation
- Capital Structure Review
- Use of Proceeds Validation
- Cross-Section Conflicts

For each issue, provide:
- Issue description
- Rule citation (e.g., Rule 201(f))
- Severity (Critical, High, Medium)
- Page number where found
- Specific explanation with details from the document
- AI reasoning explaining how you detected this issue

**II. ✅ Internal Reviewer Verification (Oversight Tasks)**
Always include these five checks:
1. Financial Statements (Rule 201(t)) - Confirm required level of assurance
2. Investor Fee Calculation
3. Intermediary Compensation (Rule 201(l))
4. Intermediary Other Interest (Rule 201(l))
5. Progress Update Mechanism (Rule 203)

**III. 👍 Required Disclosures Present and Compliant (Rule 201)**
List all Rule 201 disclosures that ARE present and meet minimum standards.

**IV. 🧑‍💼 Key Personnel and Significant Ownership**
- Officers and Directors with their positions
- 20%+ owners with ownership percentages
- Control persons for entity owners

**CRITICAL ANALYSIS RULES:**
1. PRIORITIZE INCONSISTENCIES: Any conflicting information (amounts, dates, numbers) is CRITICAL
2. FLAG MISSING MATERIAL TERMS: Debt maturity, conversion terms, use of proceeds detail
3. CHECK MATH: Verify all calculations and cross-references
4. ASSESS SPECIFICITY: Flag generic/boilerplate language in risks and use of proceeds
5. VERIFY ALIGNMENT: Business description must match financials and risk factors

**COMPLIANCE CHECKLIST:**
{checklist}

**FORM C TO ANALYZE:**
Issuer: {issuer_name}

{form_c_text}

Generate the complete compliance report now.
"""


class ComplianceAnalyzer:
    """Analyze Form C documents for compliance using AI"""
    
    def __init__(self, api_key: str = None):
        """Initialize with Google Gemini API key"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Use Gemini 2.0 Flash for fast results
    
    def analyze_form_c(self, issuer_name: str, form_c_text: str) -> Dict:
        """
        Analyze a Form C document for compliance issues
        
        Args:
            issuer_name: Name of the issuer
            form_c_text: Extracted text from Form C PDF
            
        Returns:
            Dictionary containing structured compliance analysis
        """
        try:
            # Prepare the prompt
            prompt = REVIEW_PROMPT_TEMPLATE.format(
                checklist=COMPLIANCE_CHECKLIST,
                issuer_name=issuer_name,
                form_c_text=form_c_text[:100000]  # Limit to ~100k chars to fit in context
            )
            
            logger.info(f"Analyzing Form C for {issuer_name}...")
            
            # Call Gemini API
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Lower temperature for more consistent analysis
                    max_output_tokens=8000,  # Gemini can handle longer outputs
                    top_p=0.95,
                )
            )
            
            analysis_text = response.text
            
            # Parse the response into structured data
            structured_analysis = self._parse_analysis(analysis_text)
            
            return {
                "success": True,
                "issuer_name": issuer_name,
                "raw_analysis": analysis_text,
                "structured_analysis": structured_analysis,
                "model_used": "gemini-2.0-flash-exp",
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error analyzing Form C: {str(e)}")
            return {
                "success": False,
                "issuer_name": issuer_name,
                "raw_analysis": "",
                "structured_analysis": {},
                "error": str(e)
            }
    
    def _parse_analysis(self, analysis_text: str) -> Dict:
        """
        Parse the AI analysis into structured sections
        
        This is a simple parser - in production, you might want to use
        structured output or more sophisticated parsing
        """
        sections = {
            "amendments": [],
            "verifications": [],
            "compliant_disclosures": [],
            "key_personnel": []
        }
        
        # For now, return the raw text in sections
        # In a production system, you'd parse this more carefully
        sections["raw_text"] = analysis_text
        
        return sections

