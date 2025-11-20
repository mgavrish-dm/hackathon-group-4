import { useState } from "react";
import { Badge, Button, Card, Tabs, Tooltip, Alert } from "flowbite-react";
import {
  CloudArrowUp,
  CheckCircle,
  ExclamationCircle,
  InfoCircle,
  AngleDown,
  AngleUp,
} from "flowbite-react-icons/outline";

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

const MOCK_AMENDMENTS: Amendment[] = [
  {
    issue: "Inconsistent max offering amount between summary and financial section",
    rule: "Rule 201(a)",
    severity: "Critical",
    page: 3,
    summary:
      "Summary states $5M max offering; financial section indicates $4.5M. Must be reconciled.",
    tooltip: "Critical to ensure all offering amounts match across the Form C to avoid investor confusion and SEC inquiries.",
    aiReasoning: "AI detected $5,000,000 in the executive summary (page 3, line 24) and $4,500,000 in Section IV Financial Information (page 12, line 8). This $500,000 discrepancy requires immediate correction.",
  },
  {
    issue: "Missing description of prior use of proceeds",
    rule: "Rule 201(f)",
    severity: "Critical",
    page: 8,
    summary:
      "No disclosure of how proceeds from previous offerings were used as required.",
    tooltip: "SEC requires transparency on how previous funding was deployed to assess management's capital allocation track record.",
    aiReasoning: "AI found references to a previous $1.2M raise in 2022 but could not locate the required use-of-proceeds disclosure for that offering in Section III or the narrative.",
  },
  {
    issue: "Insufficient detail on related party transactions",
    rule: "Rule 201(s)",
    severity: "High",
    page: 12,
    summary:
      "Related party transactions mentioned but lack required detail on terms and purpose.",
    tooltip: "Related party transactions must be fully disclosed to identify potential conflicts of interest.",
    aiReasoning: "AI identified a $50,000 consulting agreement with 'Chen Advisory LLC' (page 12) but found no disclosure of relationship to CEO Sarah Chen or specific services rendered.",
  },
  {
    issue: "Risk factor section does not address industry-specific risks",
    rule: "Rule 201(g)",
    severity: "Medium",
    page: 6,
    summary:
      "Generic risk factors present, but industry-specific regulatory risks not addressed.",
    tooltip: "Investors need to understand risks specific to the issuer's industry, not just boilerplate language.",
    aiReasoning: "AI compared risk factors against fintech industry standards and found no mention of payment processing regulations, banking partner dependencies, or consumer protection compliance.",
  },
  {
    issue: "Outdated financial statements (>15 months old)",
    rule: "Rule 201(t)",
    severity: "Critical",
    page: 14,
    summary:
      "Most recent financial statements dated 18 months ago. Must provide updated statements.",
    tooltip: "Financial statements must be recent to give investors an accurate picture of current financial health.",
    aiReasoning: "AI extracted financial statement date as December 31, 2022 from page 14. Current filing date is June 2024, resulting in an 18-month gap exceeding the 15-month Rule 201(t) threshold.",
  },
];

const MOCK_RISK_FACTOR_ISSUES: Amendment[] = [
  {
    issue: "Missing industry-specific risk factors",
    rule: "Rule 201(g)",
    severity: "High",
    page: 6,
    summary:
      "Risk factors are generic and do not address regulatory risks specific to the fintech/payments industry.",
    tooltip: "Generic risks don't help investors assess industry-specific challenges the company may face.",
    aiReasoning: "AI classified the business as fintech/payments based on revenue description (page 5) but found only 2 of 12 risk factors address industry-specific regulatory or operational risks.",
  },
  {
    issue: "Risk factors contradict financial condition discussion",
    rule: "Rule 201(g), 201(v)",
    severity: "High",
    page: 7,
    summary:
      "Risk section mentions 'limited operating history' but financial discussion describes 3+ years of operations.",
    tooltip: "Contradictions between sections reduce credibility and can trigger SEC comments.",
    aiReasoning: "AI found 'limited operating history' on page 7 but also detected 'operating since January 2021' on page 15, creating a 3+ year operational timeline inconsistent with the risk language.",
  },
  {
    issue: "Boilerplate risk language not tailored to issuer",
    rule: "Rule 201(g)",
    severity: "Medium",
    page: 6,
    summary:
      "Several risk factors appear copy-pasted from templates without customization to company circumstances.",
    tooltip: "Boilerplate language suggests inadequate disclosure and may not reflect actual material risks.",
    aiReasoning: "AI text analysis found 87% similarity between Risk #3 and Risk #5 with standard Reg CF templates, with no issuer-specific modifications.",
  },
  {
    issue: "Conflicts between business description and listed risks",
    rule: "Rule 201(b), 201(g)",
    severity: "Medium",
    page: 5,
    summary:
      "Business description highlights B2B SaaS model but risks focus heavily on consumer market dynamics.",
    tooltip: "Risk factors must align with the actual business model to be meaningful to investors.",
    aiReasoning: "AI identified 'enterprise SaaS platform' as primary business model (page 5) but 8 of 12 risk factors reference consumer market conditions, creating a business model mismatch.",
  },
];

const MOCK_FINANCIAL_CONSISTENCY: Amendment[] = [
  {
    issue: "Max offering amount requires audit but only review provided",
    rule: "Rule 201(t)",
    severity: "Critical",
    page: 14,
    summary:
      "Offering amount of $1.2M triggers audit requirement under Reg CF, but only CPA review financials provided.",
    tooltip: "Reg CF has specific thresholds: offerings >$1.07M require audited financials, not just reviewed.",
    aiReasoning: "AI calculated max offering of $1,200,000 (page 3) exceeding the $1,070,000 audit threshold, but detected only 'reviewed by CPA' language (page 14) instead of required 'audited' assurance.",
  },
  {
    issue: "Share count × price ≠ stated valuation",
    rule: "Rule 201(i)",
    severity: "High",
    page: 10,
    summary:
      "Cap table shows 5M shares at $2/share = $10M valuation, but summary states $8M pre-money valuation.",
    tooltip: "Mathematical inconsistencies in valuation calculations undermine the entire offering structure.",
    aiReasoning: "AI computed 5,000,000 shares × $2.00/share = $10,000,000 from cap table (page 11) but found $8,000,000 pre-money valuation stated in summary (page 4), a $2M discrepancy.",
  },
  {
    issue: "Revenue totals do not match across sections",
    rule: "Rule 201(t)",
    severity: "High",
    page: 15,
    summary:
      "Income statement shows $450K revenue; narrative discussion references $425K in the same period.",
    tooltip: "All financial figures must be internally consistent to maintain credibility and avoid SEC scrutiny.",
    aiReasoning: "AI extracted $450,000 from Q4 2023 revenue line (page 15, Table 2) but narrative text states 'Q4 revenue of $425,000' (page 9, paragraph 3).",
  },
  {
    issue: "Expense categories have rounding errors",
    rule: "Rule 201(t)",
    severity: "Medium",
    page: 16,
    summary:
      "Individual expense line items sum to $312K but total expenses stated as $310K.",
    tooltip: "Rounding errors suggest lack of attention to detail and can raise questions about financial controls.",
    aiReasoning: "AI summed operating expenses: $125K + $87K + $65K + $35K = $312,000, but 'Total Operating Expenses' shows $310,000 (page 16), a $2K discrepancy.",
  },
];

const MOCK_CAP_TABLE_ISSUES: Amendment[] = [
  {
    issue: "Missing conversion terms for outstanding SAFE notes",
    rule: "Rule 201(i)",
    severity: "Critical",
    page: 11,
    summary:
      "Cap table lists $250K in SAFE notes but does not disclose valuation cap or discount rate.",
    tooltip: "Investors must understand how existing convertible instruments will dilute their ownership.",
    aiReasoning: "AI detected '$250,000 SAFE Notes' in cap table (page 11, row 8) but found no valuation cap or discount rate mentioned in that section or in the securities description.",
  },
  {
    issue: "No maturity date for convertible note",
    rule: "Rule 201(i)",
    severity: "High",
    page: 11,
    summary:
      "Convertible note instrument described without maturity date or conversion trigger events.",
    tooltip: "Material terms like maturity dates impact investor rights and must be fully disclosed.",
    aiReasoning: "AI found 'Convertible Note - $100,000' (page 11) with interest rate of 6% but no maturity date or conversion triggers anywhere in Section IV or securities description.",
  },
  {
    issue: "Cap table ownership percentages don't match narrative",
    rule: "Rule 201(i)",
    severity: "High",
    page: 10,
    summary:
      "Cap table shows founder with 40% ownership; narrative summary states 'founders retain majority control' (implies >50%).",
    tooltip: "Discrepancies between cap table and narrative create confusion about actual ownership structure.",
    aiReasoning: "AI calculated Sarah Chen owns 35% + Michael Torres owns 20% = 55% founder ownership from cap table, but narrative states 'founders retain majority control' which matched. However, individual founder ownership of 40% claimed in summary conflicts with cap table showing 35%.",
  },
];

const MOCK_USE_OF_PROCEEDS_ISSUES: Amendment[] = [
  {
    issue: "Missing allocation percentages for use of proceeds",
    rule: "Rule 201(f)",
    severity: "High",
    page: 8,
    summary:
      "Use of proceeds section lists categories (marketing, R&D, operations) but provides no percentage breakdown.",
    tooltip: "Investors need to understand how their capital will be allocated across different business needs.",
    aiReasoning: "AI identified three use categories on page 8 but found no percentage allocations or dollar amounts for any category, making it impossible to assess capital deployment priorities.",
  },
  {
    issue: "Overly vague 'general corporate purposes' allocation",
    rule: "Rule 201(f)",
    severity: "Medium",
    page: 8,
    summary:
      "35% of proceeds allocated to 'general corporate purposes' without further detail.",
    tooltip: "Large unspecified allocations suggest lack of strategic planning and reduce investor confidence.",
    aiReasoning: "AI calculated 35% ($420,000 of $1,200,000) allocated to 'general corporate purposes' without any breakdown or strategic justification provided in the use of proceeds section.",
  },
  {
    issue: "Large unallocated portion without justification",
    rule: "Rule 201(f)",
    severity: "Medium",
    page: 8,
    summary:
      "15% of total raise shown as 'unallocated buffer' without explaining the strategic rationale.",
    tooltip: "Any unallocated funds >10% should explain why the company needs flexibility in deployment.",
    aiReasoning: "AI found 15% ($180,000) marked as 'buffer' or 'unallocated' with no explanation. Best practice is to justify any unallocated amount >10% of total raise.",
  },
];

const MOCK_CROSS_SECTION_CONFLICTS: Amendment[] = [
  {
    issue: "Summary projects profitability; financials show mounting losses",
    rule: "Rule 201(a), 201(v)",
    severity: "Critical",
    page: 4,
    summary:
      "Executive summary states company is 'on track to profitability in 2024' but financial statements show losses increasing QoQ.",
    tooltip: "Forward-looking statements must be consistent with historical financial performance trends.",
    aiReasoning: "AI found 'on track to profitability in 2024' (page 4) but detected Q1 2024 loss of -$125K vs Q4 2023 loss of -$95K (page 15), showing deteriorating performance contrary to the forward-looking statement.",
  },
  {
    issue: "Use of proceeds conflicts with stated financial condition",
    rule: "Rule 201(f), 201(v)",
    severity: "High",
    page: 9,
    summary:
      "Financial discussion emphasizes cash burn and runway concerns, but use of proceeds allocates only 10% to working capital.",
    tooltip: "Capital allocation should address the most pressing financial needs identified in the filing.",
    aiReasoning: "AI detected 'current runway of 4 months' and 'monthly burn of $45K' (page 9) but use of proceeds allocates only $120K (10%) to working capital, insufficient to address stated cash concerns.",
  },
  {
    issue: "Business description highlights B2B revenue; financials show 80% consumer",
    rule: "Rule 201(b), 201(t)",
    severity: "High",
    page: 5,
    summary:
      "Business model described as 'enterprise SaaS platform' but revenue breakdown is 80% consumer subscriptions.",
    tooltip: "Business description must accurately reflect the actual revenue composition and customer base.",
    aiReasoning: "AI classified business as 'enterprise SaaS' from description (page 5) but revenue table shows consumer subscriptions = $360K vs enterprise = $90K (80%/20% split, page 15).",
  },
  {
    issue: "Offering terms reference equity, cap table shows debt conversion",
    rule: "Rule 201(j), 201(i)",
    severity: "Medium",
    page: 12,
    summary:
      "Offering terms describe sale of common stock, but cap table notes suggest proceeds will first convert existing debt.",
    tooltip: "The actual use and structure of securities being offered must be clearly and consistently described.",
    aiReasoning: "AI found 'offering common stock' (page 3) but cap table footnote states 'upon closing, $250K convertible note will convert to equity' (page 11), creating uncertainty about actual securities offered.",
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
  {
    name: "Intermediary Compensation (Rule 201(l))",
    status: "Verified",
    note: "5% commission disclosed and within acceptable range",
    tooltip: "Confirms intermediary compensation is disclosed and complies with FINRA rules.",
  },
  {
    name: "Intermediary Other Interest (Rule 201(l))",
    status: "Needs Review",
    note: "Check for any warrants or equity compensation",
    tooltip: "Identifies any additional interests the intermediary may have beyond standard commission.",
  },
  {
    name: "Progress Update Mechanism (Rule 203)",
    status: "Verified",
    note: "Quarterly update requirement confirmed in offering terms",
    tooltip: "Ensures the issuer has committed to providing ongoing updates to investors as required.",
  },
];

const MOCK_DISCLOSURES: Disclosure[] = [
  { item: "Business description", rule: "Rule 201(b)", status: "Compliant" },
  { item: "Risk factors", rule: "Rule 201(g)", status: "Needs Review" },
  { item: "Capital structure", rule: "Rule 201(i)", status: "Compliant" },
  {
    item: "Description of securities",
    rule: "Rule 201(j)",
    status: "Compliant",
  },
  { item: "Use of proceeds", rule: "Rule 201(f)", status: "Compliant" },
  {
    item: "Related party transactions",
    rule: "Rule 201(s)",
    status: "Compliant",
  },
  {
    item: "Discussion of financial condition",
    rule: "Rule 201(v)",
    status: "Compliant",
  },
  { item: "Other material information", rule: "Rule 201(x)", status: "Compliant" },
];

const MOCK_OFFICERS: Officer[] = [
  { name: "Sarah Chen", role: "Officer", title: "Chief Executive Officer" },
  { name: "Michael Torres", role: "Officer", title: "Chief Financial Officer" },
  { name: "Jennifer Kim", role: "Director", title: "Board Member" },
  { name: "David Patel", role: "Director", title: "Board Member" },
];

const MOCK_OWNERS: Owner[] = [
  {
    owner: "Sarah Chen",
    type: "Individual",
    ownership: "35%",
  },
  {
    owner: "Velocity Ventures LLC",
    type: "Entity",
    ownership: "25%",
    controlPersons: [
      "Robert Martinez (Managing Partner)",
      "Lisa Anderson (General Partner)",
    ],
  },
  {
    owner: "Michael Torres",
    type: "Individual",
    ownership: "20%",
  },
];

// Mock API response structure
interface AnalysisResult {
  issuerName: string;
  reportTitle: string;
  disclaimer: string;
  sections: {
    requiredIssuerAmendments: Amendment[];
    internalReviewerVerification: VerificationItem[];
    disclosuresPresentAndCompliant: Disclosure[];
    keyPersonnelAndOwnership: {
      officersAndDirectors: Officer[];
      twentyPercentOwners: Owner[];
    };
  };
}

export default function App() {
  const [hasSampleData, setHasSampleData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());

  // New state for file upload and analysis
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [issuerName, setIssuerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleUseSampleData = () => {
    setShowError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasSampleData(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 1500);
  };

  const handleFileSelect = (file: File) => {
    // Validate PDF
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF document.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setAnalysisResult(null);
    setHasSampleData(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleAnalyzeFormC = () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setHasSampleData(false);
    setAnalysisResult(null);

    // Mock API call - replace this with real backend later
    // Example: fetch(BACKEND_URL, { method: 'POST', body: formData })
    setTimeout(() => {
      const mockResponse: AnalysisResult = {
        issuerName: issuerName || "Example Robotics Inc.",
        reportTitle: `Form C - 201 Disclosure Analysis Report: ${issuerName || "Example Robotics Inc."}`,
        disclaimer: "This review constitutes the initial internal compliance assessment by DealMaker Securities LLC, and the Form C has not yet been filed with the SEC.",
        sections: {
          requiredIssuerAmendments: [
            {
              issue: "Max offering amount is inconsistent between summary ($1,070,000) and financial section ($1,500,000).",
              rule: "Rule 201(t)",
              severity: "Critical",
              page: 3,
              summary: "AI detected a $430,000 discrepancy that must be corrected for filing accuracy.",
              tooltip: "Critical to ensure all offering amounts match across the Form C to avoid investor confusion and SEC inquiries.",
              aiReasoning: "AI extracted $1,070,000 from the executive summary (page 3, line 12) and $1,500,000 from Section IV Financial Information (page 14, table 2). This $430,000 discrepancy requires immediate correction before filing.",
            },
            {
              issue: "Missing description of how proceeds from previous $850K raise in 2023 were utilized.",
              rule: "Rule 201(f)",
              severity: "High",
              page: 9,
              summary: "Prior use of proceeds disclosure is required but not found in the filing.",
              tooltip: "SEC requires transparency on how previous funding was deployed to assess management's capital allocation track record.",
              aiReasoning: "AI found references to a $850,000 seed round in Q2 2023 mentioned in the business narrative (page 5) but could not locate the required use-of-proceeds reconciliation in Section III or anywhere else in the document.",
            },
            {
              issue: "Risk factors do not address industry-specific robotics manufacturing risks.",
              rule: "Rule 201(g)",
              severity: "Medium",
              page: 7,
              summary: "Generic risk language present but no mention of supply chain, component sourcing, or manufacturing-specific risks.",
              tooltip: "Investors need to understand risks specific to the issuer's industry, not just boilerplate language.",
              aiReasoning: "AI classified the business as robotics manufacturing based on revenue description (page 4) but found only 1 of 10 risk factors addresses manufacturing or supply chain risks specific to the robotics industry.",
            },
          ],
          internalReviewerVerification: [
            {
              name: "Financial Statements – Level of Assurance",
              status: "Pending",
              note: "Issuer's max raise indicates 'Review' is acceptable; confirm auditor's letter.",
              tooltip: "Ensures the financial statements meet the required level of third-party assurance based on offering size.",
            },
            {
              name: "Investor Fee Calculation",
              status: "Verified",
              note: "5% platform fee confirmed via order form and disclosed in offering terms.",
              tooltip: "Verifies that investor fees are properly calculated and disclosed to avoid regulatory issues.",
            },
            {
              name: "Intermediary Compensation (Rule 201(l))",
              status: "Verified",
              note: "Commission structure disclosed and within acceptable range.",
              tooltip: "Confirms intermediary compensation is disclosed and complies with FINRA rules.",
            },
          ],
          disclosuresPresentAndCompliant: [
            {
              item: "Business Description",
              rule: "Rule 201(a)",
              status: "Compliant",
            },
            {
              item: "Risk Factors",
              rule: "Rule 201(g)",
              status: "Needs Review",
            },
            {
              item: "Use of Proceeds",
              rule: "Rule 201(f)",
              status: "Compliant",
            },
            {
              item: "Financial Condition",
              rule: "Rule 201(v)",
              status: "Compliant",
            },
          ],
          keyPersonnelAndOwnership: {
            officersAndDirectors: [
              { name: "Sarah Thompson", role: "CEO", title: "Chief Executive Officer" },
              { name: "Marcus Chen", role: "CFO", title: "Chief Financial Officer" },
              { name: "Dr. Emily Rodriguez", role: "CTO", title: "Chief Technology Officer" },
            ],
            twentyPercentOwners: [
              {
                owner: "Robotics Ventures LLC",
                type: "Entity",
                ownership: "28.5%",
                controlPersons: ["Laura Ingram (Managing Partner)", "Dev Patel (General Partner)"],
              },
              {
                owner: "Sarah Thompson",
                type: "Individual",
                ownership: "22%",
              },
            ],
          },
        },
      };

      setAnalysisResult(mockResponse);
      setLoading(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 1800);
  };

  const handleRetry = () => {
    if (selectedFile) {
      handleAnalyzeFormC();
    }
  };

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
      case "Critical":
        return "failure";
      case "High":
        return "warning";
      case "Medium":
        return "yellow";
    }
  };

  const getStatusColor = (status: Status | "Compliant" | "Needs Review") => {
    switch (status) {
      case "Verified":
      case "Compliant":
        return "success";
      case "Pending":
        return "info";
      case "Needs Review":
        return "warning";
    }
  };

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
        <p className="text-sm leading-relaxed text-gray-400">
          {amendment.summary}
        </p>
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

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <div className="mb-6 border-l-4 border-teal-400 bg-slate-800/40 p-4">
      <h3 className="mb-2 text-lg font-semibold text-teal-400">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className="dealmaker-theme min-h-screen">
      <div className="internal-banner border-b border-slate-700/50 bg-slate-800/80 px-4 py-2.5 text-center backdrop-blur-sm">
        <p className="text-sm text-gray-300">
          <span className="mr-2">🔒</span>
          <span className="font-semibold">Internal Use Only</span>
          <span className="mx-2">—</span>
          Form C documents are provided by the Issuer. This tool is for
          internal first-pass compliance review by DealMaker Securities LLC.
        </p>
      </div>
      <nav className="nav-bar sticky top-0 z-20 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="logo text-2xl font-bold">
            <span className="text-teal-400">d</span>
            <span className="text-white">ealmaker</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-6 md:flex">
              <a href="#" className="nav-link">
                Overview
              </a>
              <a href="#" className="nav-link active">
                Form C Review
              </a>
              <a href="#" className="nav-link">
                Help
              </a>
            </div>
            <a href="#" className="nav-link text-sm">
              Sign In
            </a>
            <Button className="cta-button" size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm text-gray-400">
              The Issuer has already submitted their Form C. Upload the
              document here to complete the internal compliance review.
            </p>
            <div className="ai-badge mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2">
              <svg
                className="h-4 w-4 text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm font-semibold text-teal-400">
                AI-Powered Compliance
              </span>
            </div>

            <h1 className="hero-title-large mb-6">
              <span className="block text-white">Form C Review,</span>
              <span className="block text-teal-400">Simplified</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-300">
              Upload your SEC Form C filing and receive instant compliance
              analysis powered by advanced AI. Identify issues before they
              become problems.
            </p>

            {/* BEFORE VS AFTER STRIP */}
            <div className="mb-10">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Before vs After
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="before-card border-slate-600 bg-slate-800/40">
                  <h4 className="mb-3 text-base font-semibold text-gray-300">
                    Today (Manual Review)
                  </h4>
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
                  <h4 className="mb-3 text-base font-semibold text-teal-400">
                    With AI Pre-Review
                  </h4>
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

            {/* HOW IT WORKS */}
            <Card className="how-it-works-card dealmaker-card mb-8">
              <h3 className="mb-4 text-lg font-semibold text-white">
                How It Works
              </h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-400">
                    1
                  </span>
                  <span className="text-sm text-gray-300">
                    Upload the Form C provided by the Issuer.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-400">
                    2
                  </span>
                  <span className="text-sm text-gray-300">
                    AI scans the document and cross-checks it against Rule 201
                    and DealMaker's internal SOPs.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-sm font-bold text-teal-400">
                    3
                  </span>
                  <span className="text-sm text-gray-300">
                    Compliance reviews prioritized issues, finalizes amendments,
                    and communicates with the Issuer.
                  </span>
                </li>
              </ol>
            </Card>

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

          <div className="flex flex-col justify-center">
            <Card className="upload-card dealmaker-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20">
                  <svg
                    className="h-5 w-5 text-teal-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Upload Form C
                </h3>
              </div>

              {/* Issuer Name Input */}
              <div className="mb-4">
                <label htmlFor="issuerName" className="mb-2 block text-sm font-medium text-gray-300">
                  Issuer Name
                </label>
                <input
                  type="text"
                  id="issuerName"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  placeholder="Enter issuer company name"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
                />
              </div>

              {/* Upload Zone */}
              <input
                type="file"
                id="fileInput"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div
                className="upload-zone group mb-4 cursor-pointer rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/30 px-8 py-16 text-center transition-all hover:border-teal-400 hover:bg-slate-700/30 hover:shadow-teal"
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <CloudArrowUp className="mx-auto mb-4 h-16 w-16 text-slate-500 transition-colors group-hover:text-teal-400" />
                <p className="mb-2 text-lg font-semibold text-gray-200">
                  Drop your file here
                </p>
                <p className="mb-4 text-sm text-gray-400">
                  Upload the Form C PDF provided by the Issuer for internal
                  review. This tool does not surface results to Issuers.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="file-type-badge">PDF</Badge>
                </div>
              </div>

              {/* Selected File Display */}
              {selectedFile && (
                <div className="mb-4 rounded-lg border border-teal-500/30 bg-teal-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 flex-shrink-0 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="flex-1 truncate text-sm font-medium text-teal-300">{selectedFile.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyzeFormC}
                className="cta-button mb-4 w-full"
                size="lg"
                disabled={!selectedFile || loading}
              >
                {loading ? "Analyzing..." : "Analyze Form C"}
              </Button>

              {/* Sample Data Button */}
              <Button
                onClick={handleUseSampleData}
                color="gray"
                className="mb-6 w-full"
                size="lg"
                disabled={isLoading || loading}
              >
                {isLoading ? "Loading..." : "Use Sample Form C"}
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
                  <span className="text-sm text-gray-300">100% Accurate</span>
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

        {/* LOADING STATE */}
        {(isLoading || loading) && (
          <div className="loading-section mt-12">
            <Card className="dealmaker-card">
              <div className="loading-state">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-teal-400">
                    AI is analyzing the Form C…
                  </span>
                  <span className="text-sm text-gray-400">Processing</span>
                </div>
                <p className="mb-3 text-xs text-gray-500">
                  Cross-checking against Rule 201 and DealMaker SOPs
                </p>
                <div className="progress-bar h-2 overflow-hidden rounded-full bg-slate-700">
                  <div className="progress-fill h-full bg-gradient-to-r from-teal-400 to-cyan-400"></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ERROR STATE */}
        {(showError || error) && (
          <div className="error-section mt-12">
            <Alert
              color="failure"
              onDismiss={() => {
                setShowError(false);
                setError(null);
              }}
              className="border-red-500/50 bg-red-500/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">Error:</span> {error || "We couldn't read this document. Please upload a valid Form C PDF or contact Compliance."}
                </div>
                {selectedFile && error && (
                  <Button
                    size="xs"
                    color="light"
                    onClick={handleRetry}
                    className="ml-4"
                  >
                    Retry
                  </Button>
                )}
              </div>
            </Alert>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !loading && !hasSampleData && !analysisResult && !showError && !error && (
          <div className="empty-section mt-12">
            <Card className="dealmaker-card">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ExclamationCircle className="mb-4 h-16 w-16 text-gray-600" />
                <h3 className="mb-2 text-xl font-semibold text-gray-300">
                  No analysis yet
                </h3>
                <p className="max-w-md text-sm text-gray-500">
                  Upload a Form C or use sample data to generate a compliance
                  draft.
                </p>
              </div>
            </Card>
          </div>
        )}

        <section className="why-section mt-20">
          <h2 className="mb-12 text-center text-3xl font-bold text-white sm:text-4xl">
            Why DealMaker Compliance AI?
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="feature-card dealmaker-card">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/20">
                <svg
                  className="h-7 w-7 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">
                Lightning Fast
              </h3>
              <p className="leading-relaxed text-gray-400">
                Reduce review time from 3+ hours to just 5 minutes with
                automated analysis
              </p>
            </Card>

            <Card className="feature-card dealmaker-card">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/20">
                <svg
                  className="h-7 w-7 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">
                Always Compliant
              </h3>
              <p className="leading-relaxed text-gray-400">
                Stay up-to-date with the latest SEC/FINRA regulations
                automatically
              </p>
            </Card>

            <Card className="feature-card dealmaker-card">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500/20">
                <svg
                  className="h-7 w-7 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">
                Zero Errors
              </h3>
              <p className="leading-relaxed text-gray-400">
                100% consistency guaranteed - never miss a critical compliance
                issue
              </p>
            </Card>
          </div>
        </section>

        {(hasSampleData || analysisResult) && (
          <section className="results-section mt-20">
            {/* IMPACT SNAPSHOT */}
            <Card className="impact-snapshot-card dealmaker-card mb-8">
              <h3 className="mb-6 text-xl font-semibold text-white">
                Impact Snapshot
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-teal-400">
                    2.5h
                  </div>
                  <div className="text-xs text-gray-400">
                    Time Saved / Form
                  </div>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-teal-400">
                    25+
                  </div>
                  <div className="text-xs text-gray-400">
                    Hours Saved / Week
                  </div>
                </div>
                <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 text-center">
                  <div className="mb-1 text-3xl font-bold text-teal-400">
                    4.2
                  </div>
                  <div className="text-xs text-gray-400">
                    Avg Critical Issues Caught / Form
                  </div>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-gray-500">
                Assumes ~10 Form C reviews per week at 2.5 hours saved per
                review.
              </p>
            </Card>

            <Card className="dealmaker-card">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="section-title text-2xl font-semibold text-white">
                      {analysisResult?.reportTitle || "Compliance Report"}
                    </h2>
                    <Badge color="purple" className="text-xs">
                      AI-Generated
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs text-gray-500">
                    Powered by DealMaker Securities SOP v1.0 and Rule 201
                    disclosure checklist.
                  </p>
                  <p className="text-sm text-gray-400">
                    This analysis is part of the internal DealMaker Securities
                    review workflow and is not visible to the Issuer.
                  </p>
                </div>
                <Button size="xs" color="gray" className="ml-4">
                  <svg
                    className="mr-1.5 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export Report
                </Button>
              </div>

              <div className="status-banner mb-8 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge color="info" className="font-semibold">
                    AI-Generated Compliance Draft
                  </Badge>
                  <Badge color="warning">Human Reviewer Required</Badge>
                  <Badge color="purple">Sample Data</Badge>
                  <Badge color="warning">Not for External Distribution</Badge>
                </div>
                <p className="text-sm leading-relaxed text-gray-300">
                  This review constitutes the initial internal compliance
                  assessment by DealMaker Securities LLC, and the Form C has
                  not yet been filed with the SEC.
                </p>
              </div>

              <div className="dealmaker-tabs">
                <Tabs aria-label="Compliance sections" variant="underline">
                  <Tabs.Item
                    active
                    title={
                      <span className="tab-title">
                        🛑 Required Issuer Amendments
                      </span>
                    }
                    icon={ExclamationCircle}
                  >
                    <div className="tab-content space-y-8">
                      <div>
                        <SectionHeader
                          title="General Issues"
                          description="Material disclosure deficiencies that the issuer must correct."
                        />
                        <div className="space-y-4">
                          {(analysisResult?.sections.requiredIssuerAmendments || MOCK_AMENDMENTS).map((amendment, index) => (
                            <IssueCard key={index} amendment={amendment} index={index} section="general" />
                          ))}
                        </div>
                      </div>

                      <div>
                        <SectionHeader
                          title="Risk Factor Issues"
                          description="Problems with risk factor disclosure quality, specificity, and internal consistency."
                        />
                        <div className="space-y-4">
                          {(!analysisResult && MOCK_RISK_FACTOR_ISSUES.map((amendment, index) => (
                            <IssueCard key={index} amendment={amendment} index={index} section="risk" />
                          )))}
                        </div>
                      </div>

                      {!analysisResult && (
                        <>
                          <div>
                            <SectionHeader
                              title="Financial Consistency & Math Validation"
                              description="Mathematical errors and inconsistencies in financial disclosures that must be corrected."
                            />
                            <div className="space-y-4">
                              {MOCK_FINANCIAL_CONSISTENCY.map((amendment, index) => (
                                <IssueCard key={index} amendment={amendment} index={index} section="financial" />
                              ))}
                            </div>
                          </div>

                          <div>
                            <SectionHeader
                              title="Capital Structure Review"
                              description="Issues with cap table, convertible instruments, and ownership disclosure."
                            />
                            <div className="space-y-4">
                              {MOCK_CAP_TABLE_ISSUES.map((amendment, index) => (
                                <IssueCard key={index} amendment={amendment} index={index} section="cap-table" />
                              ))}
                            </div>
                          </div>

                          <div>
                            <SectionHeader
                              title="Use of Proceeds Validation"
                              description="Problems with clarity, specificity, and allocation of offering proceeds."
                            />
                            <div className="space-y-4">
                              {MOCK_USE_OF_PROCEEDS_ISSUES.map((amendment, index) => (
                                <IssueCard key={index} amendment={amendment} index={index} section="proceeds" />
                              ))}
                            </div>
                          </div>

                          <div>
                            <SectionHeader
                              title="Cross-Section Conflicts"
                              description="Contradictions and inconsistencies between different sections of the Form C."
                            />
                            <div className="space-y-4">
                              {MOCK_CROSS_SECTION_CONFLICTS.map((amendment, index) => (
                                <IssueCard key={index} amendment={amendment} index={index} section="cross-section" />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Tabs.Item>

                  <Tabs.Item
                    title={
                      <span className="tab-title">
                        ✅ Internal Reviewer Verification
                      </span>
                    }
                    icon={CheckCircle}
                  >
                    <div className="tab-content space-y-4">
                      <p className="text-sm text-gray-400">
                        Internal checks that Compliance must verify before
                        approval.
                      </p>

                      <div className="space-y-3">
                        {(analysisResult?.sections.internalReviewerVerification || MOCK_VERIFICATIONS).map((item, index) => (
                          <div
                            key={index}
                            className="verification-card rounded-lg border border-slate-600 bg-slate-800/30 p-5 transition-all hover:bg-slate-800/50"
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex flex-1 items-center gap-2">
                                <h4 className="font-semibold text-white">
                                  {item.name}
                                </h4>
                                {item.tooltip && (
                                  <Tooltip content={item.tooltip} className="tooltip-custom">
                                    <InfoCircle className="h-4 w-4 flex-shrink-0 text-teal-400 hover:text-teal-300" />
                                  </Tooltip>
                                )}
                              </div>
                              <Badge color={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Tabs.Item>

                  <Tabs.Item
                    title={
                      <span className="tab-title">
                        👍 Disclosures Present & Compliant
                      </span>
                    }
                  >
                    <div className="tab-content space-y-4">
                      <p className="text-sm text-gray-400">
                        Key disclosures required by Rule 201 that are present
                        and meet minimum standards.
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
                            {(analysisResult?.sections.disclosuresPresentAndCompliant || MOCK_DISCLOSURES).map((disclosure, index) => (
                              <tr
                                key={index}
                                className="border-b border-slate-700/50 transition-colors hover:bg-slate-800/30"
                              >
                                <td className="px-4 py-3 font-medium text-gray-200">
                                  {disclosure.item}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-400">
                                  {disclosure.rule}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge
                                    color={getStatusColor(disclosure.status)}
                                  >
                                    {disclosure.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Tabs.Item>

                  <Tabs.Item
                    title={
                      <span className="tab-title">
                        🧑‍💼 Key Personnel & Ownership
                      </span>
                    }
                  >
                    <div className="tab-content space-y-6">
                      <p className="text-sm text-gray-400">
                        Officers, directors, and 20%+ beneficial owners.
                      </p>

                      <div>
                        <h4 className="mb-4 text-lg font-semibold text-white">
                          Officers & Directors
                        </h4>
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
                            {(analysisResult?.sections.keyPersonnelAndOwnership.officersAndDirectors || MOCK_OFFICERS).map((officer, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-slate-700/50 transition-colors hover:bg-slate-800/30"
                                >
                                  <td className="px-4 py-3 font-medium text-gray-200">
                                    {officer.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-400">
                                    {officer.role}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-400">
                                    {officer.title}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-4 text-lg font-semibold text-white">
                          20%+ Owners
                        </h4>
                        <div className="space-y-4">
                          {(analysisResult?.sections.keyPersonnelAndOwnership.twentyPercentOwners || MOCK_OWNERS).map((owner, index) => (
                            <div
                              key={index}
                              className="owner-card rounded-lg border border-slate-600 bg-slate-800/30 p-5 transition-all hover:-translate-y-0.5 hover:border-slate-500 hover:shadow-md"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <h5 className="text-lg font-semibold text-white">
                                  {owner.owner}
                                </h5>
                                <Badge color="info" className="text-base font-bold">
                                  {owner.ownership}
                                </Badge>
                              </div>
                              <p className="mb-2 text-sm text-gray-400">
                                Type:{" "}
                                <span className="text-gray-300">
                                  {owner.type}
                                </span>
                              </p>
                              {owner.controlPersons && (
                                <div className="mt-3 rounded-md bg-slate-900/50 p-3">
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-400">
                                    Control Persons:
                                  </p>
                                  <ul className="ml-4 space-y-1 text-sm text-gray-300">
                                    {owner.controlPersons.map((person, i) => (
                                      <li key={i} className="list-disc">
                                        {person}
                                      </li>
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
          </section>
        )}
      </main>

      <footer className="border-t border-slate-700/50 bg-slate-900/50 px-4 py-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs text-gray-500">
            © DealMaker Securities LLC — Internal Use Only. This tool is
            restricted to authorized personnel.
          </p>
        </div>
      </footer>
    </div>
  );
}
