// Types
export type Severity = "Critical" | "High" | "Medium";
export type Status = "Verified" | "Pending" | "Needs Review";

export interface ParsedIssue {
  issue: string;
  rule: string;
  severity: Severity;
  summary: string;
  page: number;
  pageList?: number[];
  aiReasoning?: string;
  tooltip?: string;
}

export interface ParsedVerification {
  item: string;
  status: Status;
  note?: string;
}

export interface ParsedDisclosure {
  requirement: string;
  present: boolean;
  compliant: boolean;
  rule: string;
}

export interface ParsedPersonnel {
  name: string;
  position: string;
  ownershipPercentage?: string;
  isOfficer: boolean;
  isDirector: boolean;
}

export interface ParsedReport {
  amendments: ParsedIssue[];
  verifications: ParsedVerification[];
  disclosures: ParsedDisclosure[];
  personnel: ParsedPersonnel[];
}

export function parseAIReport(rawText: string): ParsedReport {
  console.log("=== parseAIReport called (v2) ===");
  console.log("Raw text length:", rawText.length);
  console.log("Raw text preview:", rawText.substring(0, 500));
  
  const result: ParsedReport = {
    amendments: [],
    verifications: [],
    disclosures: [],
    personnel: [],
  };

  // Simple approach: find issues by looking for key patterns
  const lines = rawText.split('\n');
  let currentIssue: Partial<ParsedIssue> | null = null;
  let inAmendmentsSection = false;
  let inVerificationsSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Section detection
    if (line.includes('Required Issuer Amendments') || line.includes('🛑')) {
      inAmendmentsSection = true;
      inVerificationsSection = false;
      continue;
    }
    
    if (line.includes('Internal Reviewer Verification') || line.includes('✅')) {
      inAmendmentsSection = false;
      inVerificationsSection = true;
      continue;
    }
    
    if (line.includes('Required Disclosures Present') || line.includes('👍')) {
      inAmendmentsSection = false;
      inVerificationsSection = false;
      continue;
    }
    
    // Parse amendments
    if (inAmendmentsSection) {
      // Look for issue description
      if (trimmedLine.includes('Issue description:')) {
        // Save previous issue if exists
        if (currentIssue && currentIssue.issue && currentIssue.summary) {
          result.amendments.push({
            issue: currentIssue.issue,
            rule: currentIssue.rule || 'Rule 201',
            severity: currentIssue.severity || 'Medium',
            summary: currentIssue.summary,
            page: currentIssue.page || 1,
            aiReasoning: currentIssue.aiReasoning,
            tooltip: currentIssue.aiReasoning ? `AI Reasoning: ${currentIssue.aiReasoning}` : undefined,
          });
        }
        
        // Start new issue
        currentIssue = {};
        const issueText = trimmedLine.split('Issue description:')[1]?.replace(/[*]/g, '').trim();
        if (issueText) {
          currentIssue.issue = issueText;
        }
      } else if (currentIssue && trimmedLine.includes('Rule citation:')) {
        currentIssue.rule = trimmedLine.split('Rule citation:')[1]?.replace(/[*]/g, '').trim() || 'Rule 201';
      } else if (currentIssue && trimmedLine.includes('Severity:')) {
        const severityText = trimmedLine.split('Severity:')[1]?.replace(/[*]/g, '').trim();
        if (severityText === 'Critical' || severityText === 'High' || severityText === 'Medium') {
          currentIssue.severity = severityText;
        }
      } else if (currentIssue && (trimmedLine.includes('Page number') || trimmedLine.includes('Page:'))) {
        const pageMatch = trimmedLine.match(/(\d+)/);
        if (pageMatch) {
          currentIssue.page = parseInt(pageMatch[1]);
        }
      } else if (currentIssue && trimmedLine.includes('Specific explanation')) {
        const explanationStart = trimmedLine.indexOf('Specific explanation');
        const colonIndex = trimmedLine.indexOf(':', explanationStart);
        if (colonIndex !== -1) {
          currentIssue.summary = trimmedLine.substring(colonIndex + 1).replace(/[*]/g, '').trim();
        }
        
        // Collect multi-line explanation
        let j = i + 1;
        while (j < lines.length && lines[j].trim() && !lines[j].includes(':')) {
          if (currentIssue.summary) {
            currentIssue.summary += ' ' + lines[j].trim();
          }
          j++;
        }
      } else if (currentIssue && trimmedLine.includes('AI reasoning')) {
        const reasoningStart = trimmedLine.indexOf('AI reasoning');
        const colonIndex = trimmedLine.indexOf(':', reasoningStart);
        if (colonIndex !== -1) {
          currentIssue.aiReasoning = trimmedLine.substring(colonIndex + 1).replace(/[*]/g, '').trim();
        }
      }
    }
  }
  
  // Don't forget the last issue
  if (currentIssue && currentIssue.issue && currentIssue.summary) {
    result.amendments.push({
      issue: currentIssue.issue,
      rule: currentIssue.rule || 'Rule 201',
      severity: currentIssue.severity || 'Medium',
      summary: currentIssue.summary,
      page: currentIssue.page || 1,
      aiReasoning: currentIssue.aiReasoning,
      tooltip: currentIssue.aiReasoning ? `AI Reasoning: ${currentIssue.aiReasoning}` : undefined,
    });
  }
  
  console.log(`=== Parsed ${result.amendments.length} amendments ===`);
  result.amendments.forEach((issue, idx) => {
    console.log(`Issue ${idx + 1}: ${issue.severity} - ${issue.issue.substring(0, 50)}...`);
  });
  
  return result;
}
