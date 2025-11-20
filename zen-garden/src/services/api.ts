/**
 * API Service for Form C Review Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AnalysisResponse {
  success: boolean;
  issuer_name: string;
  total_pages: number;
  raw_analysis: string;
  structured_analysis: {
    raw_text?: string;
    amendments?: any[];
    verifications?: any[];
    compliant_disclosures?: any[];
    key_personnel?: any[];
  };
  model_used?: string;
  error?: string | null;
}

export interface HealthResponse {
  status: string;
  message: string;
  openai_configured: boolean;
}

/**
 * Check if the API backend is healthy
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
}

/**
 * Upload and analyze a Form C PDF
 */
export async function analyzeFormC(
  file: File,
  issuerName: string
): Promise<AnalysisResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('issuer_name', issuerName);

    const response = await fetch(`${API_BASE_URL}/api/analyze-form-c`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Analysis failed: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

/**
 * Test the analysis endpoint with mock data
 */
export async function testAnalysis(): Promise<AnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test-analysis`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Test analysis failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Test analysis error:', error);
    throw error;
  }
}

