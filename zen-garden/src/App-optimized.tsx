import { useState, useRef } from "react";
import { Badge, Button, Card, Tabs, Tooltip, Alert } from "flowbite-react";
import {
  CloudArrowUp,
  CheckCircle,
  ExclamationCircle,
  InfoCircle,
  AngleDown,
  AngleUp,
  Clipboard,
  Check,
} from "flowbite-react-icons/outline";
import { analyzeFormC } from "./services/api";
import { parseAIReport, type ParsedReport } from "./utils/parseAIReport";

type Severity = "Critical" | "High" | "Medium";
type Status = "Pending" | "Verified" | "Needs Review" | "Compliant";

interface Amendment {
  issue: string;
  rule: string;
  severity: Severity;
  page: number;
  summary: string;
  tooltip?: string;
  aiReasoning?: string;
}

interface VerificationItem {
  name: string;
  status: Status;
  note: string;
  tooltip?: string;
}

interface Disclosure {
  item: string;
  rule: string;
  status: "Compliant" | "Needs Review";
}

interface Officer {
  name: string;
  role: string;
  title: string;
}

interface Owner {
  owner: string;
  type: string;
  ownership: string;
  controlPersons?: string[];
}

// Mock data for sample demonstration
const MOCK_AMENDMENTS: Amendment[] = [
  {
    issue: "Inconsistent max offering amount between summary and financial section",
    rule: "Rule 201(a)",
    severity: "Critical",
    page: 3,
    summary: "Summary states $5M max offering; financial section indicates $4.5M. Must be reconciled.",
    tooltip: "Critical to ensure all offering amounts match across the Form C to avoid investor confusion and SEC inquiries.",
    aiReasoning: "AI detected $5,000,000 in the executive summary (page 3, line 24) and $4,500,000 in Section IV Financial Information (page 12, line 8). This $500,000 discrepancy requires immediate correction.",
  },
  {
    issue: "Missing description of prior use of proceeds",
    rule: "Rule 201(f)",
    severity: "Critical",
    page: 8,
    summary: "No disclosure of how proceeds from previous offerings were used as required.",
    tooltip: "SEC requires transparency on how previous funding was deployed to assess management's capital allocation track record.",
    aiReasoning: "AI found references to a previous $1.2M raise in 2022 but could not locate the required use-of-proceeds disclosure for that offering in Section III or the narrative.",
  },
  {
    issue: "Insufficient detail on related party transactions",
    rule: "Rule 201(s)",
    severity: "High",
    page: 12,
    summary: "Related party transactions mentioned but lack required detail on terms and purpose.",
    tooltip: "Related party transactions must be fully disclosed to identify potential conflicts of interest.",
    aiReasoning: "AI identified a $50,000 consulting agreement with 'Chen Advisory LLC' (page 12) but found no disclosure of relationship to CEO Sarah Chen or specific services rendered.",
  },
];

const MOCK_VERIFICATIONS: VerificationItem[] = [
  {
    name: "Financial Statements – Level of Assurance (Rule 201(t))",
    status: "Verified",
    note: "CPA-reviewed financials confirmed for $500K+ offering",
    tooltip: "Ensures the financial statements meet the required level of third-party assurance based on offering size.",
  },
  {
    name: "Investor Fee Calculation",
    status: "Pending",
    note: "Confirm via Order Form and offering documents",
    tooltip: "Verifies that investor fees are properly calculated and disclosed to avoid regulatory issues.",
  },
];

const MOCK_DISCLOSURES: Disclosure[] = [
  { item: "Business description", rule: "Rule 201(b)", status: "Compliant" },
  { item: "Risk factors", rule: "Rule 201(g)", status: "Needs Review" },
  { item: "Capital structure", rule: "Rule 201(i)", status: "Compliant" },
];

const MOCK_OFFICERS: Officer[] = [
  { name: "Sarah Chen", role: "Officer", title: "Chief Executive Officer" },
  { name: "Michael Torres", role: "Officer", title: "Chief Financial Officer" },
];

const MOCK_OWNERS: Owner[] = [
  { owner: "Sarah Chen", type: "Individual", ownership: "35%" },
  { owner: "Velocity Ventures LLC", type: "Entity", ownership: "25%", controlPersons: ["Robert Martinez (Managing Partner)"] },
];

export default function App() {
  // UI State
  const [hasSampleData, setHasSampleData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [issuerName, setIssuerName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Analysis State
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [parsedReport, setParsedReport] = useState<ParsedReport | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [copied, setCopied] = useState(false);

  const toggleReasoning = (key: string) => {
    const newExpanded = new Set(expandedReasoning);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedReasoning(newExpanded);
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case "Critical": return "failure";
      case "High": return "warning";
      case "Medium": return "yellow";
    }
  };

  const getStatusColor = (status: Status | "Compliant" | "Needs Review") => {
    switch (status) {
      case "Verified":
      case "Compliant": return "success";
      case "Pending": return "info";
      case "Needs Review": return "warning";
    }
  };

  // File Handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      if (files[0].type !== "application/pdf") {
        setShowError(true);
        setErrorMessage("Please upload a valid PDF document.");
        return;
      }
      setUploadedFile(files[0]);
      setShowError(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setShowError(true);
        setErrorMessage("Please upload a valid PDF document.");
        return;
      }
      setUploadedFile(file);
      setShowError(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Analysis
  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setShowError(true);
      setErrorMessage("Please select a PDF file to analyze");
      return;
    }

    if (!issuerName.trim()) {
      setShowError(true);
      setErrorMessage("Please enter the issuer name");
      return;
    }

    setShowError(false);
    setIsLoading(true);
    setHasSampleData(false);
    setAnalysisProgress("Uploading PDF...");

    try {
      setTimeout(() => setAnalysisProgress("Extracting text from PDF..."), 1000);
      setTimeout(() => setAnalysisProgress("Analyzing compliance with AI..."), 3000);
      
      const result = await analyzeFormC(uploadedFile, issuerName);
      
      if (result.success) {
        setAnalysisProgress("Analysis complete!");
        setAnalysisData(result);
        
        // Parse the AI report into structured format
        const parsed = parseAIReport(result.raw_analysis);
        setParsedReport(parsed);
        
        setHasSampleData(true);
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 100);
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error: any) {
      setShowError(true);
      setErrorMessage(error.message || "Failed to analyze the document. Please try again.");
      setHasSampleData(false);
    } finally {
      setIsLoading(false);
      setAnalysisProgress("");
    }
  };

  const handleUseSampleData = () => {
    setShowError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasSampleData(true);
      setAnalysisData(null);
      setParsedReport(null);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 1500);
  };

  const handleCopyReport = () => {
    if (analysisData?.raw_analysis) {
      navigator.clipboard.writeText(analysisData.raw_analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadReport = () => {
    if (analysisData?.raw_analysis) {
      const blob = new Blob([analysisData.raw_analysis], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FormC_Analysis_${analysisData.issuer_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Component: Issue Card
  const IssueCard = ({ amendment, index, section }: { amendment: Amendment; index: number; section: string }) => {
    const reasoningKey = `${section}-${index}`;
    const isExpanded = expandedReasoning.has(reasoningKey);

    return (
      <div className="issue-card rounded-lg border border-slate-600 bg-slate-800/30 p-5 transition-all hover:-translate-y-1 hover:border-slate-500 hover:shadow-lg">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge
            color={getSeverityColor(amendment.severity)}
            className={amendment.severity === "Critical" ? "critical-badge" : ""}
          >
            {amendment.severity}
          </Badge>
          <span className="text-xs text-gray-500">Page {amendment.page}</span>
          <span className="text-xs text-gray-500">• {amendment.rule}</span>
          {amendment.tooltip && (
            <Tooltip content={amendment.tooltip} className="tooltip-custom">
              <InfoCircle className="h-4 w-4 text-teal-400 hover:text-teal-300" />
            </Tooltip>
          )}
        </div>
        <h4 className="mb-2 font-semibold text-white">{amendment.issue}</h4>
        <p className="text-sm leading-relaxed text-gray-400">{amendment.summary}</p>
        {amendment.aiReasoning && (
          <div className="mt-3">
            <button
              onClick={() => toggleReasoning(reasoningKey)}
              className="flex items-center gap-1 text-xs font-medium text-teal-400 transition-colors hover:text-teal-300"
            >
              {isExpanded ? <AngleUp className="h-3 w-3" /> : <AngleDown className="h-3 w-3" />}
              {isExpanded ? "Hide" : "View"} AI reasoning
            </button>
            {isExpanded && (
              <div className="mt-2 rounded-md border border-teal-500/30 bg-teal-500/5 p-3">
                <p className="text-xs leading-relaxed text-gray-300">
                  <span className="font-semibold text-teal-400">AI Analysis: </span>
                  {amendment.aiReasoning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Component: Section Header
  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-6 border-l-4 border-teal-400 bg-slate-800/40 p-4">
      <h3 className="mb-2 text-lg font-semibold text-teal-400">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className="dealmaker-theme min-h-screen">
      {/* Internal Banner */}
      <div className="internal-banner border-b border-slate-700/50 bg-slate-800/80 px-4 py-2.5 text-center backdrop-blur-sm">
        <p className="text-sm text-gray-300">
          <span className="mr-2">🔒</span>
          <span className="font-semibold">Internal Use Only</span>
          <span className="mx-2">—</span>
          Form C documents are provided by the Issuer. This tool is for internal first-pass compliance review by DealMaker Securities LLC.
        </p>
      </div>

      {/* Navigation */}
      <nav className="nav-bar sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="logo text-2xl font-bold">
            <span className="text-teal-400">d</span>
            <span className="text-white">ealmaker</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-6 md:flex">
              <a href="#" className="nav-link">Overview</a>
              <a href="#" className="nav-link active">Form C Review</a>
              <a href="#" className="nav-link">Help</a>
            </div>
            <a href="#" className="nav-link text-sm">Sign In</a>
            <Button className="cta-button" size="sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Description */}
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm text-gray-400">
              The Issuer has already submitted their Form C. Upload the document here to complete the internal compliance review.
            </p>
            
            <div className="ai-badge mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2">
              <svg className="h-4 w-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-teal-400">AI-Powered Compliance</span>
            </div>

            <h1 className="hero-title-large mb-6">
              <span className="block text-white">Form C Review,</span>
              <span className="block text-teal-400">Simplified</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-300">
              Upload your SEC Form C filing and receive instant compliance analysis powered by advanced AI. Identify issues before they become problems.
            </p>

            {/* Before vs After */}
            <div className="mb-10">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Before vs After</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="before-card border-slate-600 bg-slate-800/40">
                  <h4 className="mb-3 text-base font-semibold text-gray-300">Today (Manual Review)</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-gray-500">•</span>
                      <span>1–3 hours per Form C</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-gray-500">•</span>
                      <span>Dozens of manual checklist items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-gray-500">•</span>
                      <span>High reviewer-to-reviewer variance</span>
                    </li>
                  </ul>
                </Card>
                <Card className="after-card border-teal-500/50 bg-teal-500/10">
                  <h4 className="mb-3 text-base font-semibold text-teal-400">With AI Pre-Review</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" />
                      <span>&lt;5 minutes for first pass</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" />
                      <span>100% checklist coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" />
                      <span>Reviewer focuses on final decisions</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-grid mb-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="stat-item">
                <div className="stat-value text-teal-400">5 min</div>
                <div className="stat-label">Average Review Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-teal-400">100%</div>
                <div className="stat-label">Accuracy Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-teal-400">24/7</div>
                <div className="stat-label">Availability</div>
              </div>
              <div className="stat-item">
                <div className="stat-value text-teal-400">10K+</div>
                <div className="stat-label">Forms Analyzed</div>
              </div>
            </div>
          </div>

          {/* Right Column - Upload */}
          <div className="flex flex-col justify-center">
            <Card className="upload-card dealmaker-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20">
                  <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Upload Form C</h3>
              </div>

              {/* Issuer Name Input */}
              <div className="mb-4">
                <label htmlFor="issuer-name" className="mb-2 block text-sm font-medium text-gray-300">
                  Issuer Name
                </label>
                <input
                  id="issuer-name"
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  placeholder="Enter issuer company name..."
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                />
              </div>

              {/* File Upload Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div 
                onClick={handleFileClick}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                className="upload-zone group mb-6 cursor-pointer rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 px-8 py-16 text-center transition-all hover:border-teal-400 hover:bg-slate-700/30 hover:shadow-teal"
              >
                {uploadedFile ? (
                  <>
                    <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal-400" />
                    <p className="mb-2 text-lg font-semibold text-teal-400">{uploadedFile.name}</p>
                    <p className="mb-4 text-sm text-gray-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                    </p>
                    <p className="text-xs text-gray-500">Click to select a different file</p>
                  </>
                ) : (
                  <>
                    <CloudArrowUp className="mx-auto mb-4 h-16 w-16 text-slate-500 transition-colors group-hover:text-teal-400" />
                    <p className="mb-2 text-lg font-semibold text-gray-200">Drop your file here or click to browse</p>
                    <p className="mb-4 text-sm text-gray-400">
                      Upload the Form C PDF provided by the Issuer for internal review.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge className="file-type-badge">PDF</Badge>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                className="cta-button mb-4 w-full"
                size="lg"
                disabled={isLoading || !uploadedFile || !issuerName.trim()}
              >
                {isLoading ? "Analyzing..." : "Analyze Form C"}
              </Button>

              <Button
                onClick={handleUseSampleData}
                className="mb-6 w-full border border-slate-600 bg-slate-800/50 text-gray-300 hover:bg-slate-700/50"
                size="lg"
                disabled={isLoading}
              >
                Or Use Sample Data
              </Button>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-sm text-gray-300">Instant Results</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-sm text-gray-300">SEC Compliant</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20">
                    <CheckCircle className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-sm text-gray-300">AI-Powered</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-section mt-12">
            <Card className="dealmaker-card">
              <div className="loading-state">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-teal-400">
                    {analysisProgress || "AI is analyzing the Form C…"}
                  </span>
                  <span className="text-sm text-gray-400">Processing</span>
                </div>
                <p className="mb-3 text-xs text-gray-500">
                  {uploadedFile && `Analyzing ${uploadedFile.name} for ${issuerName}`}
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  Cross-checking against Rule 201 and DealMaker SOPs • Typically takes 15-30 seconds
                </p>
                <div className="progress-bar h-2 overflow-hidden rounded-full bg-slate-700">
                  <div className="progress-fill h-full bg-gradient-to-r from-teal-400 to-cyan-400"></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Error State */}
        {showError && (
          <div className="error-section mt-12">
            <Alert color="failure" onDismiss={() => setShowError(false)} className="border-red-500/50 bg-red-500/10">
              <span className="font-semibold">Error:</span> {errorMessage || "We couldn't read this document. Please upload a valid Form C PDF."}
            </Alert>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasSampleData && !showError && (
          <div className="empty-section mt-12">
            <Card className="dealmaker-card">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ExclamationCircle className="mb-4 h-16 w-16 text-gray-600" />
                <h3 className="mb-2 text-xl font-semibold text-gray-300">No analysis yet</h3>
                <p className="max-w-md text-sm text-gray-500">
                  Upload a Form C or use sample data to generate a compliance draft.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {hasSampleData && (
          <section className="results-section mt-20">
            {/* Impact Snapshot */}
            <Card className="impact-snapshot-card dealmaker-card mb-8">
              <h3 className="mb-6 text-xl font-semibold text-white">Impact Snapshot</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-teal-400">2.5h</div>
                  <div className="text-xs text-gray-400">Time Saved / Form</div>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-teal-400">25+</div>
                  <div className="text-xs text-gray-400">Hours Saved / Week</div>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-teal-400">
                    {analysisData?.total_pages || "4.2"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {analysisData ? "Total Pages Analyzed" : "Avg Critical Issues Caught / Form"}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-gray-500">
                {analysisData 
                  ? `Analyzed using ${analysisData.model_used || "AI"} for ${analysisData.issuer_name}`
                  : "Assumes ~10 Form C reviews per week at 2.5 hours saved per review."}
              </p>
            </Card>

            {/* Real AI Analysis Display */}
            {analysisData && parsedReport && (
              <Card className="dealmaker-card mb-8">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="section-title text-2xl font-semibold text-white">
                        AI Compliance Report - {analysisData.issuer_name}
                      </h2>
                      <Badge color="purple" className="text-xs">AI-Generated</Badge>
                    </div>
                    <p className="mb-2 text-xs text-gray-500">
                      Powered by {analysisData.model_used || "Gemini 2.0"} • {analysisData.total_pages} pages analyzed
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                      <Button size="xs" color="gray" onClick={handleCopyReport}>
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
                      </Button>
                    </Tooltip>
                    <Button size="xs" color="gray" onClick={handleDownloadReport}>
                      <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </Button>
                  </div>
                </div>

                <div className="status-banner mb-8 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge color="info" className="font-semibold">AI-Generated Compliance Report</Badge>
                    <Badge color="warning">Human Reviewer Required</Badge>
                    <Badge color="success">Internal Use Only</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-300">
                    This review constitutes the initial internal compliance assessment by DealMaker Securities LLC. 
                    Total pages analyzed: {analysisData.total_pages}
                  </p>
                </div>

                {/* Analysis Metadata */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-3">
                    <div className="text-xs text-gray-400">Issuer</div>
                    <div className="mt-1 font-semibold text-white">{analysisData.issuer_name}</div>
                  </div>
                  <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-3">
                    <div className="text-xs text-gray-400">Total Pages</div>
                    <div className="mt-1 font-semibold text-teal-400">{analysisData.total_pages}</div>
                  </div>
                  <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-3">
                    <div className="text-xs text-gray-400">AI Model</div>
                    <div className="mt-1 font-semibold text-white">{analysisData.model_used || "Gemini"}</div>
                  </div>
                  <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-3">
                    <div className="text-xs text-gray-400">Issues Found</div>
                    <div className="mt-1 font-semibold text-red-400">{parsedReport.amendments.length}</div>
                  </div>
                </div>

                {/* Display Parsed Analysis in Card Format */}
                <div className="dealmaker-tabs">
                  <Tabs aria-label="Compliance sections" variant="underline">
                    <Tabs.Item
                      active
                      title={<span className="tab-title">🛑 Required Issuer Amendments</span>}
                      icon={ExclamationCircle}
                    >
                      <div className="tab-content space-y-8">
                        <div>
                          <SectionHeader
                            title="General Issues"
                            description="Material disclosure deficiencies that the issuer must correct."
                          />
                          <div className="space-y-4">
                            {parsedReport.amendments.map((amendment, index) => (
                              <IssueCard key={index} amendment={amendment} index={index} section="ai-general" />
                            ))}
                            {parsedReport.amendments.length === 0 && (
                              <p className="text-sm text-gray-400">No critical issues found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Tabs.Item>

                    <Tabs.Item title={<span className="tab-title">📄 Raw Report</span>}>
                      <div className="tab-content">
                        <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-6">
                          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
                            {analysisData.raw_analysis}
                          </pre>
                        </div>
                      </div>
                    </Tabs.Item>
                  </Tabs>
                </div>
              </Card>
            )}

            {/* Mock Data Display (only when no real analysis) */}
            {!analysisData && (
              <Card className="dealmaker-card">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="section-title text-2xl font-semibold text-white">Compliance Report</h2>
                      <Badge color="purple" className="text-xs">AI-Generated</Badge>
                    </div>
                    <p className="mb-2 text-xs text-gray-500">
                      Powered by DealMaker Securities SOP v1.0 and Rule 201 disclosure checklist.
                    </p>
                    <p className="text-sm text-gray-400">
                      This analysis is part of the internal DealMaker Securities review workflow and is not visible to the Issuer.
                    </p>
                  </div>
                  <Button size="xs" color="gray" className="ml-4">
                    <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report
                  </Button>
                </div>

                <div className="status-banner mb-8 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge color="info" className="font-semibold">AI-Generated Compliance Draft</Badge>
                    <Badge color="warning">Human Reviewer Required</Badge>
                    <Badge color="purple">Sample Data</Badge>
                    <Badge color="warning">Not for External Distribution</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-300">
                    This review constitutes the initial internal compliance assessment by DealMaker Securities LLC, 
                    and the Form C has not yet been filed with the SEC.
                  </p>
                </div>

                <div className="dealmaker-tabs">
                  <Tabs aria-label="Compliance sections" variant="underline">
                    <Tabs.Item
                      active
                      title={<span className="tab-title">🛑 Required Issuer Amendments</span>}
                      icon={ExclamationCircle}
                    >
                      <div className="tab-content space-y-8">
                        <div>
                          <SectionHeader
                            title="General Issues"
                            description="Material disclosure deficiencies that the issuer must correct."
                          />
                          <div className="space-y-4">
                            {MOCK_AMENDMENTS.map((amendment, index) => (
                              <IssueCard key={index} amendment={amendment} index={index} section="general" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </Tabs.Item>

                    <Tabs.Item
                      title={<span className="tab-title">✅ Internal Reviewer Verification</span>}
                      icon={CheckCircle}
                    >
                      <div className="tab-content space-y-4">
                        <p className="text-sm text-gray-400">Internal checks that Compliance must verify before approval.</p>
                        <div className="space-y-3">
                          {MOCK_VERIFICATIONS.map((item, index) => (
                            <div
                              key={index}
                              className="verification-card rounded-lg border border-slate-600 bg-slate-800/30 p-5 transition-all hover:bg-slate-800/50"
                            >
                              <div className="mb-3 flex items-start justify-between gap-3">
                                <div className="flex flex-1 items-center gap-2">
                                  <h4 className="font-semibold text-white">{item.name}</h4>
                                  {item.tooltip && (
                                    <Tooltip content={item.tooltip} className="tooltip-custom">
                                      <InfoCircle className="h-4 w-4 flex-shrink-0 text-teal-400 hover:text-teal-300" />
                                    </Tooltip>
                                  )}
                                </div>
                                <Badge color={getStatusColor(item.status)}>{item.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-400">{item.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Tabs.Item>

                    <Tabs.Item title={<span className="tab-title">👍 Disclosures Present & Compliant</span>}>
                      <div className="tab-content space-y-4">
                        <p className="text-sm text-gray-400">
                          Key disclosures required by Rule 201 that are present and meet minimum standards.
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-slate-600">
                          <table className="compliance-table w-full">
                            <thead>
                              <tr className="border-b border-slate-600 bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Disclosure Item
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Rule
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {MOCK_DISCLOSURES.map((disclosure, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-slate-700/50 transition-colors hover:bg-slate-800/30"
                                >
                                  <td className="px-4 py-3 font-medium text-gray-200">{disclosure.item}</td>
                                  <td className="px-4 py-3 text-sm text-gray-400">{disclosure.rule}</td>
                                  <td className="px-4 py-3">
                                    <Badge color={getStatusColor(disclosure.status)}>{disclosure.status}</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Tabs.Item>

                    <Tabs.Item title={<span className="tab-title">🧑‍💼 Key Personnel & Ownership</span>}>
                      <div className="tab-content space-y-6">
                        <p className="text-sm text-gray-400">Officers, directors, and 20%+ beneficial owners.</p>

                        <div>
                          <h4 className="mb-4 text-lg font-semibold text-white">Officers & Directors</h4>
                          <div className="overflow-x-auto rounded-lg border border-slate-600">
                            <table className="compliance-table w-full">
                              <thead>
                                <tr className="border-b border-slate-600 bg-slate-800/50">
                                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Name
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Role
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Title
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {MOCK_OFFICERS.map((officer, index) => (
                                  <tr
                                    key={index}
                                    className="border-b border-slate-700/50 transition-colors hover:bg-slate-800/30"
                                  >
                                    <td className="px-4 py-3 font-medium text-gray-200">{officer.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">{officer.role}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400">{officer.title}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-4 text-lg font-semibold text-white">20%+ Owners</h4>
                          <div className="space-y-4">
                            {MOCK_OWNERS.map((owner, index) => (
                              <div
                                key={index}
                                className="owner-card rounded-lg border border-slate-600 bg-slate-800/30 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-500 hover:shadow-md"
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <h5 className="text-lg font-semibold text-white">{owner.owner}</h5>
                                  <Badge color="info" className="text-base font-bold">{owner.ownership}</Badge>
                                </div>
                                <p className="mb-2 text-sm text-gray-400">
                                  Type: <span className="text-gray-300">{owner.type}</span>
                                </p>
                                {owner.controlPersons && (
                                  <div className="mt-3 rounded-md bg-slate-900/50 p-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-400">
                                      Control Persons:
                                    </p>
                                    <ul className="ml-4 space-y-1 text-sm text-gray-300">
                                      {owner.controlPersons.map((person, i) => (
                                        <li key={i} className="list-disc">{person}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Tabs.Item>
                  </Tabs>
                </div>
              </Card>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 px-4 py-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs text-gray-500">
            © DealMaker Securities LLC — Internal Use Only. This tool is restricted to authorized personnel.
          </p>
        </div>
      </footer>
    </div>
  );
}

