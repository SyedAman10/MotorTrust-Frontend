// AI Diagnosis Service
import { TokenManager } from './auth';

const API_BASE_URL = 'http://localhost:5000';

export interface DiagnosisRequest {
  message: string;
  car_make?: string;
  car_model?: string;
  car_year?: number;
}

export interface DiagnosisResponse {
  diagnosis: string;
  tokensUsed: number;
  model: string;
}

export interface HealthStatus {
  status: string;
  model?: string;
  message?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
  };
}

export class AIDiagnosisService {
  private static getAuthHeader(): string {
    const token = TokenManager.getToken();
    if (!token) throw new Error('Please log in to use AI Diagnosis');
    return `Bearer ${token}`;
  }

  // Full diagnosis with car details
  static async getDiagnosis(data: DiagnosisRequest): Promise<ApiResponse<DiagnosisResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/ai-diagnosis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to get diagnosis');
    }

    return response.json();
  }

  // Quick diagnosis without car details
  static async getQuickDiagnosis(message: string): Promise<ApiResponse<DiagnosisResponse>> {
    const response = await fetch(`${API_BASE_URL}/api/ai-diagnosis/quick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to get diagnosis');
    }

    return response.json();
  }

  // Check service health
  static async checkHealth(): Promise<ApiResponse<HealthStatus>> {
    const response = await fetch(`${API_BASE_URL}/api/ai-diagnosis/health`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to check service health');
    }

    return response.json();
  }
}

