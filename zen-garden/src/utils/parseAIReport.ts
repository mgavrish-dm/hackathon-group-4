/**
 * Parse AI-generated compliance report into structured format
 * Enhanced to handle multiple AI response formats
 */

export interface ParsedIssue {
  issue: string;
  rule: string;
  severity: "Critical" | "High" | "Medium";
  page: number;
  summary: string;
  aiReasoning?: string;
}

export interface ParsedReport {
  amendments: ParsedIssue[];
  verifications: Array<{
    name: string;
    status: "Verified" | "Pending" | "Needs Review";
    note: string;
  }>;
  disclosures: Array<{
    item: string;
    rule: string;
    status: "Compliant" | "Needs Review";
  }>;
  personnel: Array<{
    name: string;
    role: string;
    title?: string;
    ownership?: string;
  }>;
}

export function parseAIReport(rawText: string): ParsedReport {
  console.log("=== Starting parseAIReport ===");
  console.log("Raw text length:", rawText.length);
  console.log("First 800 chars:", rawText.substring(0, 800));
  
  const result: ParsedReport = {
    amendments: [],
    verifications: [],
    disclosures: [],
    personnel: [],
  };

  // Check if this is a Gemini format report
  const isGeminiFormat = rawText.includes("FORM C - 201 DISCLOSURE ANALYSIS REPORT") || 
                        rawText.includes("Form C - 201 Disclosure Analysis Report");
  
  console.log("Is Gemini format:", isGeminiFormat);

  // Try to find sections using multiple patterns
  let amendmentsText = "";
  let verificationsText = "";
  let disclosuresText = "";
  let personnelText = "";

  // Method 1: Look for sections with Roman numerals and emojis
  const sectionPattern1 = /(?:^|\n)(?:\*\*)?([IVX]+\.)\s*([🛑✅👍🧑‍💼])?\s*([^*\n]+)(?:\*\*)?/gm;
  const matches = Array.from(rawText.matchAll(sectionPattern1));
  
  console.log("Section matches found:", matches.length);
  
  for (const match of matches) {
    console.log("Section found:", match[1], match[3]);
  }

  // Method 2: Look for sections by their titles with more flexible patterns
  // Allow for ** markers or plain text
  const amendmentsMatch = rawText.match(/(?:\*\*)?(?:I\.\s*)?(?:🛑\s*)?(?:REQUIRED ISSUER AMENDMENTS|Required Issuer Amendments)(?:\*\*)?([\s\S]*?)(?=(?:\*\*)?(?:II\.|III\.|IV\.)|$)/i);
  const verificationsMatch = rawText.match(/(?:\*\*)?(?:II\.\s*)?(?:✅\s*)?(?:INTERNAL REVIEWER VERIFICATION|Internal Reviewer Verification)(?:\*\*)?([\s\S]*?)(?=(?:\*\*)?(?:III\.|IV\.)|$)/i);
  const disclosuresMatch = rawText.match(/(?:\*\*)?(?:III\.\s*)?(?:👍\s*)?(?:DISCLOSURES PRESENT|Disclosures Present|Required Disclosures Present)(?:\*\*)?([\s\S]*?)(?=(?:\*\*)?(?:IV\.)|$)/i);
  const personnelMatch = rawText.match(/(?:\*\*)?(?:IV\.\s*)?(?:🧑‍💼\s*)?(?:KEY PERSONNEL|Key Personnel)(?:\*\*)?([\s\S]*?)$/i);

  if (amendmentsMatch) {
    console.log("Found amendments section via regex");
    amendmentsText = amendmentsMatch[0];
  }
  
  if (verificationsMatch) {
    console.log("Found verifications section via regex");
    verificationsText = verificationsMatch[0];
  }
  
  if (disclosuresMatch) {
    console.log("Found disclosures section via regex");
    disclosuresText = disclosuresMatch[0];
  }
  
  if (personnelMatch) {
    console.log("Found personnel section via regex");
    personnelText = personnelMatch[0];
  }

  // If we couldn't find sections, try to parse the whole text
  if (!amendmentsText && !verificationsText && !disclosuresText && !personnelText) {
    console.log("No clear sections found, trying to parse entire text");
    amendmentsText = rawText;
  }

  // Parse each section
  if (amendmentsText) {
    result.amendments = parseAmendmentsEnhanced(amendmentsText);
  }
  
  if (verificationsText) {
    result.verifications = parseVerifications(verificationsText);
  }
  
  if (disclosuresText) {
    result.disclosures = parseDisclosures(disclosuresText);
  }
  
  if (personnelText) {
    result.personnel = parsePersonnel(personnelText);
  }

  console.log("=== Final parsed report ===");
  console.log("Amendments:", result.amendments.length);
  console.log("Verifications:", result.verifications.length);
  console.log("Disclosures:", result.disclosures.length);
  console.log("Personnel:", result.personnel.length);

  return result;
}

function parseAmendmentsEnhanced(text: string): ParsedIssue[] {
  console.log("=== parseAmendmentsEnhanced ===");
  console.log("Text length:", text.length);
  console.log("First 400 chars:", text.substring(0, 400));
  
  const issues: ParsedIssue[] = [];
  
  // Remove the section header to focus on content
  const cleanedText = text.replace(/^[^\n]*(?:REQUIRED ISSUER AMENDMENTS|Required Issuer Amendments)[^\n]*\n*/i, '');
  
  // Pattern to find categories like "- **Category Name**"
  const categoryPattern = /^-\s*\*\*([^*]+)\*\*$/gm;
  const categoryMatches = Array.from(cleanedText.matchAll(categoryPattern));
  
  console.log(`Found ${categoryMatches.length} categories`);
  console.log("Cleaned text preview:", cleanedText.substring(0, 500));
  
  // Process each category
  for (let i = 0; i < categoryMatches.length; i++) {
    const categoryMatch = categoryMatches[i];
    const nextCategoryMatch = categoryMatches[i + 1];
    
    const categoryName = categoryMatch[1].trim();
    const startPos = categoryMatch.index! + categoryMatch[0].length;
    const endPos = nextCategoryMatch ? nextCategoryMatch.index! : cleanedText.length;
    const categoryContent = cleanedText.substring(startPos, endPos);
    
    console.log(`\nProcessing category: ${categoryName}`);
    console.log(`Category content preview:`, categoryContent.substring(0, 200));
    
    // Find issues within this category
    // Pattern for indented issue blocks - try multiple patterns
    let issueMatches: RegExpMatchArray[] = [];
    
    // Pattern 1: "  - **Issue description:**"
    const issuePattern1 = /^\s{2,}-\s+\*\*Issue description:\*\*\s*(.+?)(?=^\s{2,}-\s+\*\*Issue description:|^\s*-\s*\*\*|^\*\*II\.|$)/gms;
    issueMatches = Array.from(categoryContent.matchAll(issuePattern1));
    
    // Pattern 2: "  - Issue description:" (without asterisks)
    if (issueMatches.length === 0) {
      const issuePattern2 = /^\s{2,}-\s+Issue description:\s*(.+?)(?=^\s{2,}-\s+Issue description:|^\s*-\s*\*\*|^\*\*II\.|$)/gms;
      issueMatches = Array.from(categoryContent.matchAll(issuePattern2));
    }
    
    // Pattern 3: Just look for any indented bullet point
    if (issueMatches.length === 0) {
      const issuePattern3 = /^\s{2,}-\s+(.+?)(?=^\s{2,}-\s+|^\s*-\s*\*\*|^\*\*II\.|$)/gms;
      issueMatches = Array.from(categoryContent.matchAll(issuePattern3));
    }
    
    console.log(`Found ${issueMatches.length} issues in category ${categoryName}`);
    
    for (const issueMatch of issueMatches) {
      const issueBlock = issueMatch[0];
      const parsedIssue = parseGeminiCategoryIssue(issueBlock);
      if (parsedIssue) {
        issues.push(parsedIssue);
      }
    }
  }
  
  // If no categories found, try the direct format
  if (categoryMatches.length === 0) {
    console.log("No categories found, trying direct format");
    // Pattern 1: "- Issue description: text" followed by indented "- Rule citation:" etc
    const newFormatPattern = /^\s*-\s+(?:\*\*)?Issue description:?\*?\*?\s*(.+?)(?=^\s*-\s+(?:\*\*)?Issue description:|^\s*\*\*II\.|^\*\*II\.|$)/gms;
    const newFormatMatches = Array.from(cleanedText.matchAll(newFormatPattern));
    
    console.log(`Found ${newFormatMatches.length} issues in direct format`);
    
    if (newFormatMatches.length > 0) {
    // Process new format
    for (const match of newFormatMatches) {
      const issueBlock = match[0];
      console.log("\nProcessing issue block:", issueBlock.substring(0, 100));
      
      const issue = parseNewGeminiIssueBlock(issueBlock);
      if (issue) {
        issues.push(issue);
      }
    }
  } else {
    // Try the old format with categories
    const oldCategoryPattern = /^-\s*\*\*([^*]+)\*\*\s*$/gm;
    const oldCategoryMatches = Array.from(cleanedText.matchAll(oldCategoryPattern));
    
    console.log(`Found ${oldCategoryMatches.length} categories in old format`);
    
    if (oldCategoryMatches.length > 0) {
      // Process old format with categories
      const categories: { name: string; content: string }[] = [];
      
      for (let i = 0; i < oldCategoryMatches.length; i++) {
        const match = oldCategoryMatches[i];
        const nextMatch = oldCategoryMatches[i + 1];
        
        const categoryName = match[1].trim();
        const startPos = match.index! + match[0].length;
        const endPos = nextMatch ? nextMatch.index! : cleanedText.length;
        
        categories.push({
          name: categoryName,
          content: cleanedText.substring(startPos, endPos),
        });
      }
      
      for (const category of categories) {
        console.log(`\nProcessing category: ${category.name}`);
        const issueBlocks = extractIssueBlocks(category.content);
        
        for (const block of issueBlocks) {
          const issue = parseGeminiIssueBlock(block);
          if (issue) {
            issues.push(issue);
          }
        }
      }
    }
  }
  } // Close the if (categoryMatches.length === 0) block

  // If still no issues found, try a more aggressive approach
  if (issues.length === 0) {
    console.log("No issues found with standard parsing, trying fallback parser");
    issues = parseFallbackFormat(cleanedText);
  }
  
  console.log(`Total parsed amendments: ${issues.length}`);
  issues.forEach((issue, idx) => {
    console.log(`Issue ${idx + 1}:`, issue.issue?.substring(0, 80) + '...');
  });
  
  return issues;
}

// Parse issues within categories with double asterisk format
function parseGeminiCategoryIssue(block: string): ParsedIssue | null {
  console.log("Parsing category issue block");
  console.log("Block content:", block.substring(0, 200));
  
  const issue: Partial<ParsedIssue> = {
    severity: "Medium",
    page: 1,
    rule: "Rule 201",
  };
  
  // Extract fields - try both with and without asterisks
  const fields = [
    { 
      patterns: [
        /^\s*-\s+\*\*Issue description:\*\*\s*(.+)$/m,
        /^\s*-\s+Issue description:\s*(.+)$/m
      ], 
      key: 'issue' 
    },
    { 
      patterns: [
        /^\s*-\s+\*\*Rule citation:\*\*\s*(.+)$/m,
        /^\s*-\s+Rule citation:\s*(.+)$/m
      ], 
      key: 'rule' 
    },
    { 
      patterns: [
        /^\s*-\s+\*\*Severity:\*\*\s*(.+)$/m,
        /^\s*-\s+Severity:\s*(.+)$/m
      ], 
      key: 'severity' 
    },
    { 
      patterns: [
        /^\s*-\s+\*\*Page number(?:\s+where found)?:\*\*\s*(.+)$/m,
        /^\s*-\s+Page number(?:\s+where found)?:\s*(.+)$/m,
        /^\s*-\s+\*\*Page number:\*\*\s*(.+)$/m,
        /^\s*-\s+Page number:\s*(.+)$/m
      ], 
      key: 'page' 
    },
    { 
      patterns: [
        /^\s*-\s+\*\*Specific explanation(?:\s+with details from the document)?:\*\*\s*(.+?)(?=^\s*-|$)/ms,
        /^\s*-\s+Specific explanation(?:\s+with details from the document)?:\s*(.+?)(?=^\s*-|$)/ms
      ], 
      key: 'summary' 
    },
    { 
      patterns: [
        /^\s*-\s+\*\*AI reasoning(?:\s+explaining how I detected this issue)?:\*\*\s*(.+?)(?=^\s*-|$)/ms,
        /^\s*-\s+AI reasoning(?:\s+explaining how I detected this issue)?:\s*(.+?)(?=^\s*-|$)/ms
      ], 
      key: 'aiReasoning' 
    },
  ];
  
  for (const field of fields) {
    let match = null;
    
    // Try each pattern for this field
    for (const pattern of field.patterns) {
      match = block.match(pattern);
      if (match) break;
    }
    
    if (match) {
      const value = match[1].trim();
      console.log(`Found ${field.key}:`, value.substring(0, 100));
      
      switch (field.key) {
        case 'issue':
          issue.issue = value;
          break;
        case 'rule':
          issue.rule = value || "Rule 201";
          break;
        case 'severity':
          issue.severity = value as Severity;
          break;
        case 'page':
          const pageStr = value.replace(/[^0-9,]/g, '');
          const pages = pageStr.split(',').map(p => p.trim());
          issue.page = parseInt(pages[0]) || 1;
          if (pages.length > 1) {
            issue.pageList = pages.map(p => parseInt(p)).filter(p => !isNaN(p));
          }
          break;
        case 'summary':
          issue.summary = value;
          break;
        case 'aiReasoning':
          issue.aiReasoning = value;
          break;
      }
    }
  }
  
  // Validate required fields
  if (!issue.issue || !issue.summary) {
    console.log("Missing required fields:", { issue: !!issue.issue, summary: !!issue.summary });
    return null;
  }
  
  // Generate tooltip if AI reasoning is available
  if (issue.aiReasoning) {
    issue.tooltip = `AI Reasoning: ${issue.aiReasoning}`;
  }
  
  return issue as ParsedIssue;
}

// Fallback parser for when standard formats don't work
function parseFallbackFormat(text: string): ParsedIssue[] {
  console.log("=== Fallback parser ===");
  const issues: ParsedIssue[] = [];
  
  // Look for any line that contains "Issue description:" 
  const lines = text.split('\n');
  let currentIssue: Partial<ParsedIssue> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('Issue description:')) {
      // Save previous issue if exists
      if (currentIssue && currentIssue.issue && currentIssue.summary) {
        issues.push({
          ...currentIssue,
          severity: currentIssue.severity || 'Medium',
          page: currentIssue.page || 1,
          rule: currentIssue.rule || 'Rule 201',
        } as ParsedIssue);
      }
      
      // Start new issue
      currentIssue = {};
      const issueText = line.split('Issue description:')[1]?.trim();
      if (issueText) {
        currentIssue.issue = issueText;
      }
    } else if (currentIssue) {
      // Look for other fields
      if (line.includes('Rule citation:')) {
        currentIssue.rule = line.split('Rule citation:')[1]?.trim() || 'Rule 201';
      } else if (line.includes('Severity:')) {
        const severity = line.split('Severity:')[1]?.trim();
        if (severity === 'Critical' || severity === 'High' || severity === 'Medium') {
          currentIssue.severity = severity;
        }
      } else if (line.includes('Page number')) {
        const pageText = line.split(/Page number(?:\s+where found)?:/)[1]?.trim();
        if (pageText) {
          const pageNum = parseInt(pageText.match(/\d+/)?.[0] || '1');
          currentIssue.page = pageNum;
        }
      } else if (line.includes('Specific explanation')) {
        currentIssue.summary = line.split(/Specific explanation(?:\s+with details from the document)?:/)[1]?.trim();
        
        // Collect multi-line explanation
        let j = i + 1;
        while (j < lines.length && !lines[j].includes(':') && lines[j].trim()) {
          currentIssue.summary += ' ' + lines[j].trim();
          j++;
        }
      }
    }
  }
  
  // Don't forget the last issue
  if (currentIssue && currentIssue.issue && currentIssue.summary) {
    issues.push({
      ...currentIssue,
      severity: currentIssue.severity || 'Medium',
      page: currentIssue.page || 1,
      rule: currentIssue.rule || 'Rule 201',
    } as ParsedIssue);
  }
  
  console.log(`Fallback parser found ${issues.length} issues`);
  return issues;
}

// Parse the new Gemini format with indented fields
function parseNewGeminiIssueBlock(block: string): ParsedIssue | null {
  console.log("Parsing new Gemini format block");
  
  const issue: Partial<ParsedIssue> = {
    severity: "Medium",
    page: 1,
    rule: "Rule 201",
  };
  
  // Extract fields using patterns for indented format
  // Handle both with and without ** markers
  const fields = [
    { 
      pattern: /^\s*-\s+(?:\*\*)?Issue description:?\*?\*?\s*(.+)$/m, 
      key: 'issue' 
    },
    { 
      pattern: /^\s*-\s+(?:\*\*)?Rule citation:?\*?\*?\s*(.+)$/m, 
      key: 'rule' 
    },
    { 
      pattern: /^\s*-\s+(?:\*\*)?Severity:?\*?\*?\s*(.+)$/m, 
      key: 'severity' 
    },
    { 
      pattern: /^\s*-\s+(?:\*\*)?Page number(?:\s+where)?\s+found:?\*?\*?\s*(.+)$/m, 
      key: 'page' 
    },
    { 
      pattern: /^\s*-\s+(?:\*\*)?Specific explanation(?:\s+with details from the document)?:?\*?\*?\s*(.+?)(?=^\s*-|$)/ms, 
      key: 'summary' 
    },
    { 
      pattern: /^\s*-\s+(?:\*\*)?AI reasoning(?:\s+explaining how I detected this issue)?:?\*?\*?\s*(.+?)(?=^\s*-|$)/ms, 
      key: 'aiReasoning' 
    },
  ];
  
  for (const field of fields) {
    const match = block.match(field.pattern);
    if (match) {
      const value = match[1].trim();
      
      switch (field.key) {
        case 'issue':
          issue.issue = value;
          break;
        case 'rule':
          issue.rule = value;
          break;
        case 'severity':
          issue.severity = value as "Critical" | "High" | "Medium";
          break;
        case 'page':
          // Handle page ranges like "2, 8, 35" or "22-25" or "29"
          const pageNumbers = value.match(/\d+/g);
          if (pageNumbers && pageNumbers.length > 0) {
            issue.page = parseInt(pageNumbers[0]);
          }
          break;
        case 'summary':
          issue.summary = value;
          break;
        case 'aiReasoning':
          issue.aiReasoning = value;
          break;
      }
    }
  }
  
  // Validate required fields
  if (!issue.issue || issue.issue.length < 10) {
    console.log("Invalid issue: missing or too short issue description");
    return null;
  }
  
  // Use issue as summary if no summary provided
  if (!issue.summary) {
    issue.summary = issue.issue;
  }
  
  console.log("Parsed issue:", {
    issue: issue.issue?.substring(0, 50) + "...",
    rule: issue.rule,
    severity: issue.severity,
    page: issue.page
  });
  
  return issue as ParsedIssue;
}

// Extract issue blocks from text (Gemini format)
function extractIssueBlocks(text: string): string[] {
  const blocks: string[] = [];
  
  // Pattern to find issue blocks starting with "- **Issue description:**"
  const issueStartPattern = /^\s*-\s*\*\*Issue description:\*\*/gm;
  const matches = Array.from(text.matchAll(issueStartPattern));
  
  console.log(`Found ${matches.length} issue blocks`);
  
  for (let i = 0; i < matches.length; i++) {
    const startMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    const startPos = startMatch.index!;
    const endPos = nextMatch ? nextMatch.index! : text.length;
    
    const block = text.substring(startPos, endPos).trim();
    blocks.push(block);
  }
  
  return blocks;
}

// Parse a Gemini-formatted issue block
function parseGeminiIssueBlock(block: string): ParsedIssue | null {
  console.log("Parsing Gemini issue block:", block.substring(0, 100));
  
  const issue: Partial<ParsedIssue> = {
    severity: "Medium",
    page: 1,
    rule: "Rule 201",
  };
  
  // Extract fields using specific patterns
  const fields = [
    { 
      pattern: /^\s*-\s*\*\*Issue description:\*\*\s*(.+)$/m, 
      key: 'issue' 
    },
    { 
      pattern: /^\s*-\s*\*\*Rule citation:\*\*\s*(.+)$/m, 
      key: 'rule' 
    },
    { 
      pattern: /^\s*-\s*\*\*Severity:\*\*\s*(.+)$/m, 
      key: 'severity' 
    },
    { 
      pattern: /^\s*-\s*\*\*Page number:\*\*\s*(.+)$/m, 
      key: 'page' 
    },
    { 
      pattern: /^\s*-\s*\*\*Specific explanation:\*\*\s*(.+)$/m, 
      key: 'summary' 
    },
    { 
      pattern: /^\s*-\s*\*\*AI reasoning:\*\*\s*(.+)$/m, 
      key: 'aiReasoning' 
    },
  ];
  
  for (const field of fields) {
    const match = block.match(field.pattern);
    if (match) {
      const value = match[1].trim();
      
      switch (field.key) {
        case 'issue':
          issue.issue = value;
          break;
        case 'rule':
          issue.rule = value;
          break;
        case 'severity':
          issue.severity = value as "Critical" | "High" | "Medium";
          break;
        case 'page':
          // Handle page ranges like "2, 8, 35" or "22-25"
          const pageNumbers = value.match(/\d+/g);
          if (pageNumbers && pageNumbers.length > 0) {
            issue.page = parseInt(pageNumbers[0]);
          }
          break;
        case 'summary':
          issue.summary = value;
          break;
        case 'aiReasoning':
          issue.aiReasoning = value;
          break;
      }
    }
  }
  
  // Validate required fields
  if (!issue.issue || issue.issue.length < 10) {
    console.log("Invalid issue: missing or too short issue description");
    return null;
  }
  
  // Use issue as summary if no summary provided
  if (!issue.summary) {
    issue.summary = issue.issue;
  }
  
  return issue as ParsedIssue;
}

// Keep the original parseIssueBlock for backward compatibility
function parseIssueBlock(block: string): ParsedIssue | null {
  console.log("Parsing issue block, length:", block.length);
  
  // Extract the main issue description
  let issueText = "";
  let summary = "";
  let rule = "Rule 201";
  let severity: "Critical" | "High" | "Medium" = "Medium";
  let page = 1;
  let aiReasoning: string | undefined;
  
  // Check if block contains structured fields
  const hasStructuredFormat = block.includes("Issue description:") || 
                             block.includes("Rule citation:") ||
                             block.includes("Severity:");
  
  if (hasStructuredFormat) {
    console.log("Using structured format parsing");
    
    // Extract structured fields
    const issueMatch = block.match(/Issue description:\s*([^\n]+)/i);
    const ruleMatch = block.match(/Rule citation:\s*(Rule \d+[^,\n]*)/i);
    const severityMatch = block.match(/Severity:\s*(Critical|High|Medium)/i);
    const pageMatch = block.match(/Page (?:number|reference):\s*(\d+)/i);
    const explanationMatch = block.match(/Specific explanation:\s*([^\n]+)/i);
    const reasoningMatch = block.match(/AI reasoning:\s*([^\n]+)/i);
    
    if (issueMatch) {
      issueText = issueMatch[1].trim();
      summary = explanationMatch ? explanationMatch[1].trim() : issueText;
      rule = ruleMatch ? ruleMatch[1].trim() : "Rule 201";
      severity = severityMatch ? severityMatch[1] as any : "Medium";
      page = pageMatch ? parseInt(pageMatch[1]) : 1;
      aiReasoning = reasoningMatch ? reasoningMatch[1].trim() : undefined;
    }
  } else {
    // For unstructured format, use the entire block as the issue
    console.log("Using unstructured format parsing");
    
    const lines = block.split('\n').filter(l => l.trim());
    if (lines.length === 0) return null;
    
    // First line is usually the main issue
    issueText = lines[0];
    
    // Try to extract rule, severity, and page from the rest of the text
    rule = extractRule(block) || "Rule 201";
    severity = extractSeverity(block) || "Medium";
    page = extractPage(block) || 1;
    
    // If there are multiple lines, use them as summary
    if (lines.length > 1) {
      summary = lines.slice(1).join(' ').trim();
    } else {
      summary = issueText;
    }
  }
  
  // Clean up the issue text
  issueText = issueText.replace(/^\d+\.\s*/, ''); // Remove numbering
  issueText = issueText.replace(/^[-•*]\s*/, ''); // Remove bullets
  issueText = issueText.replace(/\*\*/g, ''); // Remove markdown bold
  
  if (!issueText || issueText.length < 10) {
    return null;
  }
  
  return {
    issue: issueText,
    rule: rule,
    severity: severity,
    page: page,
    summary: summary || issueText,
    aiReasoning: aiReasoning,
  };
}

// Helper functions
function extractRule(text: string): string | null {
  // Look for various rule patterns
  const patterns = [
    /Rule\s+201\s*\([a-z]+\)/gi,  // Rule 201(a)
    /Rule\s+201[a-z]/gi,           // Rule 201a
    /Rule\s+\d+/gi,                // Rule 201
    /201\([a-z]+\)/gi,             // 201(a)
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

function extractSeverity(text: string): "Critical" | "High" | "Medium" | null {
  const severityMatch = text.match(/\b(Critical|High|Medium)\b/i);
  if (severityMatch) {
    return severityMatch[1].charAt(0).toUpperCase() + severityMatch[1].slice(1).toLowerCase() as any;
  }
  return null;
}

function extractPage(text: string): number | null {
  // Look for page references
  const patterns = [
    /[Pp]age\s+(\d+)/,
    /\bp\.?\s*(\d+)/,
    /\bpg\.?\s*(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

function parseVerifications(text: string): any[] {
  const verifications = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.includes('VERIFICATION')) continue;
    
    // Look for numbered items
    if (line.match(/^\s*\d+\./)) {
      const cleaned = line.replace(/^\s*\d+\.\s*/, '').trim();
      
      // Extract name and status
      let name = cleaned;
      let status: "Verified" | "Pending" | "Needs Review" = "Pending";
      let note = cleaned;
      
      // Check for status keywords
      if (cleaned.toLowerCase().includes('verified') || cleaned.toLowerCase().includes('confirmed')) {
        status = 'Verified';
      } else if (cleaned.toLowerCase().includes('needs') || cleaned.toLowerCase().includes('require')) {
        status = 'Needs Review';
      }
      
      // Try to extract structured format
      const structuredMatch = cleaned.match(/\*\*(.+?)\*\*:?\s*(.+)/);
      if (structuredMatch) {
        name = structuredMatch[1].trim();
        note = structuredMatch[2].trim();
      }
      
      verifications.push({ name, status, note });
    }
  }
  
  return verifications;
}

function parseDisclosures(text: string): any[] {
  const disclosures = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.includes('DISCLOSURES')) continue;
    
    // Look for bullet points or numbered items
    if (line.match(/^\s*[-•*]/) || line.match(/^\s*\d+\./)) {
      const cleaned = line.replace(/^\s*[-•*]\s*/, '').replace(/^\s*\d+\.\s*/, '').trim();
      
      // Extract rule reference
      const ruleMatch = cleaned.match(/\(Rule 201[^)]*\)/i);
      const rule = ruleMatch ? ruleMatch[0].replace(/[()]/g, '') : "Rule 201";
      
      // Extract item name (everything before the rule)
      const itemMatch = cleaned.match(/(.+?)\s*\(Rule/i);
      const item = itemMatch ? itemMatch[1].trim() : cleaned.replace(/\(Rule[^)]*\)/gi, '').trim();
      
      if (item && item.length > 5) {
        disclosures.push({
          item: item,
          rule: rule,
          status: 'Compliant', // Default to compliant
        });
      }
    }
  }
  
  return disclosures;
}

function parsePersonnel(text: string): any[] {
  const personnel = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Skip empty lines and headers
    if (!line.trim() || line.includes('PERSONNEL')) continue;
    
    // Look for patterns like "Name - Title" or "Name: Title"
    const patterns = [
      /^\s*[-•*]\s*(.+?)\s*[-–]\s*(.+)$/,  // Bullet + Name - Title
      /^\s*\d+\.\s*(.+?)\s*[-–]\s*(.+)$/,  // Number + Name - Title
      /^\s*(.+?)\s*:\s*(.+)$/,             // Name : Title
      /^\s*[-•*]\s*(.+)$/,                 // Just bullet + Name
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1] ? match[1].trim() : "";
        const titleInfo = match[2] ? match[2].trim() : "";
        
        if (name && name.length > 2) {
          // Determine role based on title keywords
          let role = "Other";
          const titleLower = titleInfo.toLowerCase();
          if (titleLower.includes('director')) {
            role = 'Director';
          } else if (titleLower.includes('officer') || titleLower.includes('ceo') || 
                    titleLower.includes('cfo') || titleLower.includes('cto') || 
                    titleLower.includes('chief')) {
            role = 'Officer';
          }
          
          personnel.push({
            name: name,
            role: role,
            title: titleInfo || undefined,
          });
          break; // Move to next line after successful match
        }
      }
    }
  }
  
  return personnel;
}