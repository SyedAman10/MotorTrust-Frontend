import { TokenManager } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Helper to get full image URL
export function getImageUrl(path: string): string {
  if (!path) return '';
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Remove leading slash if present for consistent joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

// Repair Lead types
export interface RepairLeadUser {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
}

export type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';

export interface RepairLead {
  id: number;
  title: string;
  description: string;
  car_make: string;
  car_model: string;
  car_year: number;
  urgency: UrgencyLevel;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  proposal_count: number;
  images?: string[];
  user?: RepairLeadUser;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRepairLeadRequest {
  title: string;
  description: string;
  car_make: string;
  car_model: string;
  car_year: number;
  urgency: UrgencyLevel;
  images?: File[];
}

// Proposal types
export interface ShopInfo {
  id: number;
  shop_name: string;
  phone?: string;
  email?: string;
  rating?: number;
  address?: string;
}

export interface Proposal {
  id: number;
  repair_lead_id: number;
  shop_id?: number;
  shop?: ShopInfo;
  message: string;
  estimated_cost: number;
  estimated_duration?: string;
  warranty_period?: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProposalRequest {
  repair_lead_id: number;
  message: string;
  estimated_cost: number;
  estimated_duration?: string;
  warranty_period?: string;
}

export interface RepairStats {
  total_leads?: number;
  open_leads?: number;
  total_proposals?: number;
  accepted_proposals?: number;
  total_spent?: number;
  avg_proposal_cost?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

// Shop types
export interface Shop {
  id: number;
  shop_name: string;
  shop_address: string;
  phone_number?: string;
  latitude?: number;
  longitude?: number;
  specialities?: string[];
  shop_description?: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShopRequest {
  shop_name: string;
  shop_address: string;
  phone_number?: string;
  latitude?: number;
  longitude?: number;
  specialities?: string[];
  shop_description?: string;
}

export class ShopService {
  private static getAuthHeader(): string {
    const token = TokenManager.getToken();
    if (!token) throw new Error('No authentication token found');
    return `Bearer ${token}`;
  }

  // ==================== SHOP MANAGEMENT ====================

  // Create a new shop (Shop Owner)
  static async createShop(data: CreateShopRequest): Promise<ApiResponse<{ shop: Shop }>> {
    const response = await fetch(`${API_BASE_URL}/api/shops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to create shop');
    }

    return response.json();
  }

  // Get my shop (Shop Owner)
  static async getMyShop(): Promise<ApiResponse<{ shop: Shop | null }>> {
    const response = await fetch(`${API_BASE_URL}/api/shops/my-shop`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      // 404 means no shop exists yet
      if (response.status === 404) {
        return { success: true, data: { shop: null } };
      }
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to fetch shop');
    }

    return response.json();
  }

  // Get all shops
  static async getAllShops(): Promise<ApiResponse<{ shops: Shop[] }>> {
    const response = await fetch(`${API_BASE_URL}/api/shops`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to fetch shops');
    }

    return response.json();
  }

  // ==================== REPAIR LEADS ====================

  // Get all available repair leads (for shop owners to browse)
  static async getLeads(limit = 50): Promise<ApiResponse<{ leads: RepairLead[] }>> {
    const response = await fetch(
      `${API_BASE_URL}/api/repairs/leads?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to fetch leads');
    }

    return response.json();
  }

  // Get single repair lead with proposals
  static async getLead(id: number): Promise<ApiResponse<{ lead: RepairLead; proposals: Proposal[] }>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/leads/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to fetch lead');
    }

    return response.json();
  }

  // Create repair lead (Car Owner) - supports image uploads
  static async createLead(data: CreateRepairLeadRequest): Promise<ApiResponse<{ lead: RepairLead }>> {
    const hasImages = data.images && data.images.length > 0;

    let response: Response;

    if (hasImages) {
      // Use FormData for multipart upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('car_make', data.car_make);
      formData.append('car_model', data.car_model);
      formData.append('car_year', data.car_year.toString());
      formData.append('urgency', data.urgency);
      
      // Append each image - using 'images' as field name (matching curl -F "images=@file")
      data.images!.forEach((image, index) => {
        console.log(`Appending image ${index}:`, image.name, image.type, image.size);
        formData.append('images', image, image.name);
      });

      // Debug: Log FormData contents
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      response = await fetch(`${API_BASE_URL}/api/repairs/leads`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          // Don't set Content-Type - browser will set it with boundary for multipart
        },
        body: formData,
      });
    } else {
      // Use JSON for requests without images
      const { images, ...jsonData } = data;
      response = await fetch(`${API_BASE_URL}/api/repairs/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(jsonData),
      });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to create lead');
    }

    return response.json();
  }

  // Get my repair leads (Car Owner)
  static async getMyLeads(): Promise<ApiResponse<{ leads: RepairLead[] }>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/leads/my/all`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to fetch my leads');
    }

    return response.json();
  }

  // ==================== PROPOSALS ====================

  // Submit proposal (Shop Owner)
  static async submitProposal(data: CreateProposalRequest): Promise<ApiResponse<{ proposal: Proposal }>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to submit proposal');
    }

    return response.json();
  }

  // Get my proposals (Shop Owner)
  static async getMyProposals(): Promise<ApiResponse<{ proposals: Proposal[] }>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/proposals/my/all`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to fetch proposals');
    }

    return response.json();
  }

  // Accept proposal (Car Owner)
  static async acceptProposal(id: number, notes?: string): Promise<ApiResponse<{ proposal: Proposal }>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/proposals/${id}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to accept proposal');
    }

    return response.json();
  }

  // Reject proposal (Car Owner)
  static async rejectProposal(id: number): Promise<ApiResponse<{ proposal: Proposal }>> {
    const response = await fetch(`${API_BASE_URL}/api/repairs/proposals/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || 'Failed to reject proposal');
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
      throw new Error(error.error?.message || error.message || 'Failed to fetch stats');
    }

    return response.json();
  }
}
