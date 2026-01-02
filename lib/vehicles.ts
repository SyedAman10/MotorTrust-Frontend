import { TokenManager } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface Vehicle {
  id: number;
  user_id: number;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  color?: string;
  license_plate?: string;
  mileage: number;
  purchase_date?: string;
  is_primary: boolean;
  repair_count?: number;
  last_service_date?: string;
  total_repair_cost?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleStats {
  id: number;
  year: number;
  make: string;
  model: string;
  current_mileage: number;
  total_repairs: number;
  total_cost: string;
  avg_repair_cost: string;
  last_service_date?: string;
  first_service_date?: string;
}

export interface RepairRecord {
  id: number;
  vehicle_id: number;
  service_date: string;
  service_type: string;
  description: string;
  total_cost: string;
  shop_name?: string;
  shop_rating?: number;
}

export interface CreateVehicleRequest {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  color?: string;
  license_plate?: string;
  mileage: number;
  purchase_date?: string;
  is_primary?: boolean;
}

export interface UpdateVehicleRequest {
  mileage?: number;
  color?: string;
  license_plate?: string;
  trim?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

export class VehicleService {
  private static getAuthHeader(): string {
    const token = TokenManager.getToken();
    if (!token) throw new Error('No authentication token found');
    return `Bearer ${token}`;
  }

  // Get all vehicles
  static async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch vehicles');
    }

    return response.json();
  }

  // Get primary vehicle
  static async getPrimaryVehicle(): Promise<ApiResponse<Vehicle>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/primary`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch primary vehicle');
    }

    return response.json();
  }

  // Get vehicle by ID
  static async getVehicle(id: number): Promise<ApiResponse<Vehicle>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch vehicle');
    }

    return response.json();
  }

  // Create vehicle
  static async createVehicle(data: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create vehicle');
    }

    return response.json();
  }

  // Update vehicle
  static async updateVehicle(id: number, data: UpdateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update vehicle');
    }

    return response.json();
  }

  // Delete vehicle
  static async deleteVehicle(id: number): Promise<ApiResponse<Vehicle>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete vehicle');
    }

    return response.json();
  }

  // Set primary vehicle
  static async setPrimaryVehicle(id: number): Promise<ApiResponse<Vehicle>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}/primary`, {
      method: 'PATCH',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set primary vehicle');
    }

    return response.json();
  }

  // Get vehicle repairs
  static async getVehicleRepairs(id: number): Promise<ApiResponse<RepairRecord[]>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}/repairs`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch vehicle repairs');
    }

    return response.json();
  }

  // Get vehicle statistics
  static async getVehicleStats(id: number): Promise<ApiResponse<VehicleStats>> {
    const response = await fetch(`${API_BASE_URL}/api/vehicles/${id}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch vehicle stats');
    }

    return response.json();
  }
}

