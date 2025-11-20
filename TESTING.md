# Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites

Before testing, ensure:
- ✅ Backend is running on http://localhost:8000
- ✅ Frontend is running on http://localhost:5173
- ✅ OpenAI API key is configured in `backend/.env`

Quick check:
```bash
# Test backend
curl http://localhost:8000/health

# Should return: {"status":"healthy","openai_configured":true,...}
```

---

## Test 1: Mock Data (No API Required)

**Purpose:** Verify UI works correctly without using API credits

**Steps:**
1. Open http://localhost:5173
2. Click "Or Use Sample Data" button
3. Wait 1.5 seconds for loading animation
4. Scroll down to see results

**Expected Results:**
- ✅ Loading animation appears
- ✅ Impact Snapshot shows mock statistics
- ✅ Compliance Report displays with tabs:
  - 🛑 Required Issuer Amendments (multiple categories)
  - ✅ Internal Reviewer Verification
  - 👍 Disclosures Present & Compliant
  - 🧑‍💼 Key Personnel & Ownership
- ✅ All mock issues have severity badges (Critical, High, Medium)
- ✅ Issues show page numbers and rule citations
- ✅ "View AI reasoning" buttons work

**Pass Criteria:** All mock data displays correctly

---

## Test 2: Backend Health Check

**Purpose:** Verify backend is properly configured

**Steps:**
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test root endpoint
curl http://localhost:8000/

# Test API documentation
open http://localhost:8000/docs
```

**Expected Results:**
```json
{
  "status": "healthy",
  "message": "All services operational",
  "openai_configured": true
}
```

**Pass Criteria:** 
- ✅ `openai_configured: true`
- ✅ Swagger UI loads at /docs
- ✅ No errors in backend terminal

---

## Test 3: Example Form C - Good Form

**Purpose:** Test AI analysis with a properly filled Form C

**Test File:** `c-forms/formca (1).pdf`

**Steps:**
1. Open http://localhost:5173
2. Enter issuer name: "Form CA Company"
3. Upload: `c-forms/formca (1).pdf`
4. Click "Analyze Form C"
5. Wait 15-30 seconds

**Expected Results:**
- ✅ File upload shows filename and size
- ✅ "Analyzing..." state appears
- ✅ Backend terminal shows processing logs
- ✅ Analysis completes successfully
- ✅ AI Compliance Report displays with:
  - Issuer name in title
  - Total pages analyzed
  - Model used (gpt-4o)
  - Structured compliance sections
- ✅ Report identifies issues (if any)
- ✅ Report shows compliant sections

**Backend Logs to Check:**
```
INFO:     Received Form C for analysis: Form CA Company
INFO:     Saved PDF to temporary file
INFO:     Extracting text from PDF...
INFO:     Successfully extracted X pages
INFO:     Starting AI compliance analysis...
INFO:     Analysis completed successfully
```

**Pass Criteria:** Analysis completes without errors and displays formatted report

---

## Test 4: Example Form C - Another Good Form

**Test File:** `c-forms/neurogymformc (1).pdf`

**Steps:** Same as Test 3, with different file

**Expected Results:** Similar to Test 3, may show different issues

---

## Test 5: Incorrect Form C - Financial Statement Issues

**Purpose:** Verify AI detects missing/incorrect financial statements

**Test File:** `c-forms-issues/HydroLink_Systems_Incorrect_FormC.docx` (convert to PDF first, or use another from c-forms-issues)

**Note:** The files in `c-forms-issues` are DOCX format. For actual testing, you may need to convert them to PDF or use the example metadata.

**Expected Issues AI Should Detect:**
- ❌ No CPA review or audit included
- ❌ Raised >$618k but only uncertified statements
- ❌ Missing CEO certification
- ❌ No JOBS Act accounting election mention

**Pass Criteria:** AI report flags these specific issues as Critical

---

## Test 6: Incorrect Form C - Missing Disclosures

**Test Files:** Various files in `c-forms-issues/`

**Common Issues to Test:**
1. **Aether_Materials_Corp** - Missing related party transactions
2. **Coastal_Brewing_Co** - Incomplete use of proceeds
3. **GreenWave_Mobility** - Boilerplate risk factors
4. **QuantumLabs_Inc** - Missing officer information

**Pass Criteria:** AI identifies the specific missing elements

---

## Test 7: Large PDF Performance

**Purpose:** Verify system handles large documents

**Test File:** `c-forms/neurogymformc (1).pdf` (32MB file)

**Steps:**
1. Upload the large PDF
2. Monitor processing time
3. Check memory usage in backend terminal

**Expected Results:**
- ✅ PDF extracts successfully (may take 5-10 seconds)
- ✅ Analysis completes (may take 30-60 seconds)
- ✅ No memory errors
- ✅ Full report generates

**Pass Criteria:** 
- Completes within 90 seconds
- No crashes or out-of-memory errors

---

## Test 8: Error Handling

### Test 8a: Invalid File Type
**Steps:**
1. Try to upload a .txt or .docx file
2. Click analyze

**Expected:** Error message "Only PDF files are accepted"

### Test 8b: Missing Issuer Name
**Steps:**
1. Upload valid PDF
2. Leave issuer name blank
3. Click analyze

**Expected:** Error message "Please enter the issuer name"

### Test 8c: No File Selected
**Steps:**
1. Enter issuer name
2. Don't upload file
3. Click analyze

**Expected:** Error message "Please select a PDF file to analyze"

### Test 8d: Corrupted PDF
**Steps:**
1. Upload a corrupted/encrypted PDF
2. Click analyze

**Expected:** Error message about PDF extraction failure

**Pass Criteria:** All error cases handled gracefully with clear messages

---

## Test 9: UI/UX Testing

**Purpose:** Verify user interface works smoothly

**Test Cases:**

1. **Drag & Drop Upload**
   - Drag PDF onto upload zone
   - Verify filename displays

2. **Click to Upload**
   - Click upload zone
   - File picker opens
   - Select file and verify

3. **Responsive Design**
   - Test on different screen sizes
   - Mobile view (< 768px)
   - Tablet view (768-1024px)
   - Desktop view (> 1024px)

4. **Animations**
   - Loading spinner
   - Progress bar animation
   - Smooth scrolling to results
   - Expand/collapse AI reasoning

5. **Buttons**
   - Disabled state when no file
   - Hover effects
   - Loading state

**Pass Criteria:** All UI elements work smoothly and responsively

---

## Test 10: Cross-Browser Testing

**Browsers to Test:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Pass Criteria:** Works in all major browsers

---

## Test 11: API Direct Testing

**Purpose:** Test backend API without frontend

### Using curl

```bash
# Test with actual PDF
curl -X POST http://localhost:8000/api/analyze-form-c \
  -F "file=@c-forms/formca (1).pdf" \
  -F "issuer_name=API Test Company" \
  -o response.json

# Check response
cat response.json | python3 -m json.tool
```

### Using Python

```python
import requests

# Test health
response = requests.get('http://localhost:8000/health')
print(response.json())

# Test analysis
with open('c-forms/formca (1).pdf', 'rb') as f:
    files = {'file': f}
    data = {'issuer_name': 'Python Test Company'}
    response = requests.post(
        'http://localhost:8000/api/analyze-form-c',
        files=files,
        data=data
    )
    print(response.json())
```

**Pass Criteria:** API returns valid JSON responses

---

## Test 12: Concurrent Requests

**Purpose:** Verify system handles multiple simultaneous analyses

**Steps:**
1. Open 3 browser tabs
2. Upload different PDFs in each
3. Click analyze at roughly the same time

**Expected:** All complete successfully (may be slower)

**Pass Criteria:** No crashes or errors with concurrent requests

---

## Performance Benchmarks

| Test Case | Expected Time | Pass/Fail |
|-----------|---------------|-----------|
| Small PDF (< 5 pages) | 10-15 seconds | |
| Medium PDF (5-20 pages) | 15-30 seconds | |
| Large PDF (20-50 pages) | 30-60 seconds | |
| Very Large PDF (> 50 pages) | 60-90 seconds | |

---

## Troubleshooting Tests

If tests fail, check:

1. **Backend not responding**
   - Is backend running? Check http://localhost:8000
   - Check backend terminal for errors
   - Restart backend: `python3 backend/app/main.py`

2. **OpenAI errors**
   - API key configured? Check `backend/.env`
   - API credits available? Check OpenAI dashboard
   - Rate limits? Wait a minute and retry

3. **PDF extraction fails**
   - PDF corrupted or encrypted?
   - Try different PDF
   - Check backend logs for specific error

4. **Frontend not loading**
   - Is frontend running? Check http://localhost:5173
   - Check browser console for errors
   - Clear cache and reload

---

## Test Summary Template

Use this to track your testing:

```
Date: ___________
Tester: _________

✅ Test 1: Mock Data - PASS / FAIL
✅ Test 2: Health Check - PASS / FAIL
✅ Test 3: Good Form C #1 - PASS / FAIL
✅ Test 4: Good Form C #2 - PASS / FAIL
✅ Test 5: Incorrect Form (Financial) - PASS / FAIL
✅ Test 6: Incorrect Form (Disclosures) - PASS / FAIL
✅ Test 7: Large PDF - PASS / FAIL
✅ Test 8: Error Handling - PASS / FAIL
✅ Test 9: UI/UX - PASS / FAIL
✅ Test 10: Cross-Browser - PASS / FAIL
✅ Test 11: API Direct - PASS / FAIL
✅ Test 12: Concurrent - PASS / FAIL

Notes:
_________________________________
_________________________________
```

---

## 🎯 Success Criteria

The application passes testing if:

- ✅ All basic functionality tests pass (Tests 1-6)
- ✅ Error handling works correctly (Test 8)
- ✅ UI is responsive and smooth (Test 9)
- ✅ Performance meets benchmarks (Test 7)
- ✅ Works in major browsers (Test 10)

Optional advanced tests (11-12) are nice to have.

---

## 📊 Expected AI Output Quality

Good AI analysis should:

1. **Identify Real Issues**
   - Critical issues flagged as "Critical"
   - Page numbers accurate
   - Rule citations correct (e.g., Rule 201(f))

2. **Provide Context**
   - AI reasoning explains detection method
   - Specific examples from document
   - Not generic/templated responses

3. **Be Comprehensive**
   - Checks all Rule 201 sections
   - Cross-references between sections
   - Math validation where applicable

4. **Be Actionable**
   - Clear description of what's wrong
   - Indication of how to fix
   - Priority/severity appropriate

---

Ready to test? Start with Test 1 (Mock Data) and work your way through! 🚀

