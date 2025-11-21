"""
Specific compliance issues checklist for Form C review
Based on SEC Rule 201 requirements
"""

COMPLIANCE_ISSUES_CHECKLIST = {
    "ownership_structure": [
        {
            "issue": "No owners with 20%+ equity identified",
            "rule": "Rule 201(h)",
            "severity": "Critical",
            "check": "Must identify all beneficial owners with 20% or more of voting equity"
        },
        {
            "issue": "Ownership structure table missing",
            "rule": "Rule 201(h)",
            "severity": "Critical",
            "check": "Must provide clear ownership structure including percentages"
        },
        {
            "issue": "No mention of voting rights or class differences",
            "rule": "Rule 201(m)",
            "severity": "High",
            "check": "Must disclose voting rights and any differences between share classes"
        },
        {
            "issue": "No disclosure of shareholder control risks",
            "rule": "Rule 201(d)",
            "severity": "High",
            "check": "Must disclose risks related to concentrated ownership or control"
        },
        {
            "issue": "No disclosure of principal shareholder influence",
            "rule": "Rule 201(d)",
            "severity": "Medium",
            "check": "Should describe how principal shareholders may influence company decisions"
        }
    ],
    
    "related_party_transactions": [
        {
            "issue": "No related-party transactions described",
            "rule": "Rule 201(s)",
            "severity": "Critical",
            "check": "Must disclose all related party transactions or state 'None' if applicable"
        }
    ],
    
    "business_operations": [
        {
            "issue": "Business plan not described",
            "rule": "Rule 201(b)",
            "severity": "Critical",
            "check": "Must provide description of business and business plan"
        },
        {
            "issue": "No information on operations or future growth strategy",
            "rule": "Rule 201(b)",
            "severity": "Critical",
            "check": "Must describe current operations and planned business development"
        }
    ],
    
    "issuer_information": [
        {
            "issue": "Physical address missing",
            "rule": "Rule 201(a)",
            "severity": "Critical",
            "check": "Must provide issuer's physical address"
        },
        {
            "issue": "Website not listed",
            "rule": "Rule 201(a)",
            "severity": "Medium",
            "check": "Should provide issuer's website if available"
        },
        {
            "issue": "Issuer is organized in Canada, not a U.S. state or territory",
            "rule": "Rule 100(a)(1)",
            "severity": "Critical",
            "check": "Issuer must be organized under U.S. state or territory laws"
        }
    ],
    
    "intermediary_disclosure": [
        {
            "issue": "DealMaker Securities LLC intermediary details omitted",
            "rule": "Rule 201(a)",
            "severity": "Critical",
            "check": "Must identify the intermediary through which offering is conducted"
        },
        {
            "issue": "No description of intermediary's financial interest",
            "rule": "Rule 201(r)",
            "severity": "Critical",
            "check": "Must disclose intermediary compensation and any other financial interest"
        },
        {
            "issue": "Issuer concurrently using two intermediaries for Reg CF",
            "rule": "Rule 100(a)(2)",
            "severity": "Critical",
            "check": "May only use one intermediary per offering"
        }
    ],
    
    "financial_statements": [
        {
            "issue": "No CPA review or audit included",
            "rule": "Rule 201(t)",
            "severity": "Critical",
            "check": "Financial statements must meet required level of review based on offering size"
        },
        {
            "issue": "Missing CEO certification for unaudited financials",
            "rule": "Rule 201(t)",
            "severity": "Critical",
            "check": "If financials not reviewed/audited, must include CEO certification"
        },
        {
            "issue": "No mention of accounting election under JOBS Act",
            "rule": "Rule 201(t)",
            "severity": "Low",
            "check": "May elect to use reduced accounting standards if applicable"
        }
    ],
    
    "offering_details": [
        {
            "issue": "Target offering amount exceeds limit",
            "rule": "Rule 100(a)(1)",
            "severity": "Critical",
            "check": "Reg CF offerings limited to $5M in 12-month period"
        },
        {
            "issue": "Deadline not specified",
            "rule": "Rule 201(g)",
            "severity": "Critical",
            "check": "Must specify offering deadline"
        },
        {
            "issue": "No oversubscription allocation method",
            "rule": "Rule 201(g)",
            "severity": "High",
            "check": "Must describe how oversubscriptions will be allocated"
        },
        {
            "issue": "Perk disclosure missing",
            "rule": "Rule 201(k)",
            "severity": "High",
            "check": "Must disclose any perks or rewards offered to investors"
        },
        {
            "issue": "Bonus share details absent",
            "rule": "Rule 201(k)",
            "severity": "High",
            "check": "Must clearly describe any bonus share programs"
        }
    ],
    
    "investor_rights": [
        {
            "issue": "No investor cancellation or refund procedure described",
            "rule": "Rule 303",
            "severity": "Critical",
            "check": "Must describe investor cancellation rights and procedures"
        },
        {
            "issue": "Incorrect cancellation disclosure (no 48-hour window)",
            "rule": "Rule 303",
            "severity": "Critical",
            "check": "Must allow 48-hour cancellation window before deadline"
        },
        {
            "issue": "No disclosure of 5-day reconfirmation requirement after material change",
            "rule": "Rule 304",
            "severity": "High",
            "check": "Must disclose reconfirmation requirement after material changes"
        },
        {
            "issue": "No explanation of rolling or early closing mechanics",
            "rule": "Rule 201(g)",
            "severity": "Medium",
            "check": "Should explain if using rolling closings or early closing option"
        }
    ],
    
    "valuation_risks": [
        {
            "issue": "Valuation methodology not included",
            "rule": "Rule 201(d)",
            "severity": "High",
            "check": "Should describe how valuation was determined"
        },
        {
            "issue": "No description of minority shareholder risks",
            "rule": "Rule 201(d)",
            "severity": "High",
            "check": "Must describe risks specific to minority shareholders"
        },
        {
            "issue": "No disclosure that valuation is speculative",
            "rule": "Rule 201(d)",
            "severity": "Medium",
            "check": "Should acknowledge speculative nature of valuation"
        },
        {
            "issue": "No valuation disclosure or investor fee explanation",
            "rule": "Rule 201(d)",
            "severity": "High",
            "check": "Must explain valuation and any fees charged to investors"
        }
    ],
    
    "officers_directors": [
        {
            "issue": "No names or titles of officers provided",
            "rule": "Rule 201(n)",
            "severity": "Critical",
            "check": "Must list all officers and directors with titles"
        },
        {
            "issue": "No employment history or relevant experience listed",
            "rule": "Rule 201(n)",
            "severity": "High",
            "check": "Must provide 3-year employment history for officers/directors"
        },
        {
            "issue": "No indication of other employment positions",
            "rule": "Rule 201(n)",
            "severity": "Medium",
            "check": "Should disclose other positions held by officers/directors"
        },
        {
            "issue": "Missing officer business affiliations",
            "rule": "Rule 201(n)",
            "severity": "Medium",
            "check": "Should disclose material business relationships"
        }
    ],
    
    "risk_factors": [
        {
            "issue": "No discussion of material risks or uncertainties",
            "rule": "Rule 201(d)",
            "severity": "Critical",
            "check": "Must discuss material factors that make investment risky"
        },
        {
            "issue": "Missing discussion of dilution or tax treatment",
            "rule": "Rule 201(d)",
            "severity": "High",
            "check": "Should discuss dilution risks and potential tax consequences"
        }
    ],
    
    "escrow_procedures": [
        {
            "issue": "No escrow agent identified",
            "rule": "Rule 303",
            "severity": "High",
            "check": "Should identify qualified third party holding investor funds"
        }
    ],
    
    "eligibility": [
        {
            "issue": "No certification confirming eligibility",
            "rule": "Rule 100",
            "severity": "Critical",
            "check": "Must certify eligibility to use Reg CF"
        },
        {
            "issue": "Issuer is a reporting company under the Exchange Act",
            "rule": "Rule 100(b)",
            "severity": "Critical",
            "check": "Reporting companies are ineligible for Reg CF"
        }
    ]
}

def get_all_issues_as_prompt():
    """Convert the checklist into a format suitable for AI prompt"""
    prompt_sections = []
    
    for category, issues in COMPLIANCE_ISSUES_CHECKLIST.items():
        category_title = category.replace("_", " ").title()
        prompt_sections.append(f"\n### {category_title}:")
        
        for issue_dict in issues:
            prompt_sections.append(
                f"- Check: {issue_dict['check']}\n"
                f"  If missing/inadequate, report: \"{issue_dict['issue']}\"\n"
                f"  Rule: {issue_dict['rule']}, Severity: {issue_dict['severity']}"
            )
    
    return "\n".join(prompt_sections)

def get_issues_by_severity(severity):
    """Get all issues of a specific severity level"""
    issues = []
    for category, category_issues in COMPLIANCE_ISSUES_CHECKLIST.items():
        for issue in category_issues:
            if issue['severity'] == severity:
                issues.append(issue)
    return issues

def get_issues_by_rule(rule):
    """Get all issues related to a specific rule"""
    issues = []
    for category, category_issues in COMPLIANCE_ISSUES_CHECKLIST.items():
        for issue in category_issues:
            if rule in issue['rule']:
                issues.append(issue)
    return issues
