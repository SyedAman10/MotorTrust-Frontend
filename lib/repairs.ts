import { TokenManager } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface Repair {
  id: number;
  vehicle_id: number;
  user_id?: number;
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
  service_date: string;
  service_type: string;
  description?: string;
  total_cost: string;
  mileage_at_service?: number;
  shop_id?: number;
  shop_name?: string;
  shop_address?: string;
  shop_phone?: string;
  shop_rating?: number;
  invoice_url?: string;
  photos?: string[];
  odb_codes?: string[];
  parts_replaced?: string[];
  labor_hours?: number;
  warranty_info?: string;
  insurance_claim_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface RepairStats {
  total_repairs: number;
  total_spent: string;
  avg_repair_cost: string;
  last_service_date?: string;
  vehicles_serviced: number;
  shops_used: number;
}

export interface ServiceReminder {
  vehicle_id: number;
  year: number;
  make: string;
  model: string;
  current_mileage: number;
  last_service_date?: string;
  last_service_mileage?: number;
}

export interface CreateRepairRequest {
  vehicle_id: number;
  service_date: string;
  service_type: string;
  description?: string;
  total_cost: number;
  mileage_at_service?: number;
  shop_id?: number;
  invoice_url?: string;
  photos?: string[];
  odb_codes?: string[];
  parts_replaced?: string[];
  labor_hours?: number;
  warranty_info?: string;
  insurance_claim_id?: string;
}

export interface UpdateRepairRequest {
  service_type?: string;
  description?: string;
  total_cost?: number;
  mileage_at_service?: number;
  invoice_url?: string;
  photos?: string[];
  odb_codes?: string[];
  parts_replaced?: string[];
  labor_hours?: number;
  warranty_info?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  limit?: number;
  offset?: number;
}

export class RepairService {
  private static getAuthHeader(): string {
    const token = TokenManager.getToken();
    if (!token) throw new Error('No authentication token found');
    return `Bearer ${token}`;
  }

  // Get all repairs
  static async getRepairs(limit = 50, offset = 0): Promise<ApiResponse<Repair[]>> {
    const response = await fetch(
      `${API_BASE_URL}/api/repairs?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch repairs');
    }

    return response.json();
  }

  // Get repair by ID
  static async getRepair(id: number): Promise<ApiResponse<Repair>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch repair');
    }

    return response.json();
  }

  // Create repair
  static async createRepair(data: CreateRepairRequest): Promise<ApiResponse<Repair>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create repair');
    }

    return response.json();
  }

  // Update repair
  static async updateRepair(id: number, data: UpdateRepairRequest): Promise<ApiResponse<Repair>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update repair');
    }

    return response.json();
  }

  // Delete repair
  static async deleteRepair(id: number): Promise<ApiResponse<Repair>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete repair');
    }

    return response.json();
  }

  // Get repair stats
  static async getStats(): Promise<ApiResponse<RepairStats>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/stats`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch repair stats');
    }

    return response.json();
  }

  // Get repairs in date range
  static async getRepairsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<Repair[]>> {
    const response = await fetch(
      `${API_BASE_URL}/api/repairs/range?start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch repairs');
    }

    return response.json();
  }

  // Search repairs
  static async searchRepairs(query: string): Promise<ApiResponse<Repair[]>> {
    const response = await fetch(
      `${API_BASE_URL}/api/repairs/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search repairs');
    }

    return response.json();
  }

  // Get service reminders
  static async getReminders(): Promise<ApiResponse<ServiceReminder[]>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/reminders`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch reminders');
    }

    return response.json();
  }
}

