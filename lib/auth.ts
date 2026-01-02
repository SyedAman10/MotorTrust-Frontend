// Backend role types
export type UserRole = 'car_owner' | 'shop_owner' | 'insurance_company';

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Role object from backend
export interface RoleInfo {
  id: number;
  name: UserRole;
  description?: string;
}

// Raw user from backend
export interface BackendUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  phone_number?: string;
  role: RoleInfo | UserRole;
  email_verified?: boolean;
  is_active?: boolean;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  updated_at?: string;
}

// Normalized user for frontend use
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name: string; // Combined name for display
  role: UserRole;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  email_verified?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Backend response structure
export interface BackendAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: BackendUser;
    token?: string;
    tokenType?: string;
  };
  error?: {
    message: string;
    details?: ValidationError[];
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: User;
  token?: string;
  error?: {
    message: string;
    details?: ValidationError[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Token management
export class TokenManager {
  private static readonly TOKEN_KEY = 'motortrust_token';
  private static readonly USER_KEY = 'motortrust_user';

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}

// Helper to normalize user data from backend
function normalizeUser(backendUser: BackendUser): User {
  // Handle role as object or string
  const role: UserRole = typeof backendUser.role === 'object' 
    ? backendUser.role.name 
    : backendUser.role;

  return {
    id: backendUser.id,
    email: backendUser.email,
    first_name: backendUser.first_name,
    last_name: backendUser.last_name,
    name: `${backendUser.first_name} ${backendUser.last_name || ''}`.trim(),
    role,
    phone_number: backendUser.phone || backendUser.phone_number,
    address: backendUser.address,
    city: backendUser.city,
    state: backendUser.state,
    zip_code: backendUser.zip_code,
    email_verified: backendUser.email_verified,
    created_at: backendUser.created_at,
    updated_at: backendUser.updated_at,
  };
}

// Helper to format validation errors
export function formatValidationErrors(details: ValidationError[]): string {
  return details.map(d => `${d.field}: ${d.message}`).join('\n');
}

export class AuthService {
  private static getAuthHeader(): string {
    const token = TokenManager.getToken();
    if (!token) throw new Error('No authentication token found');
    return `Bearer ${token}`;
  }

  static async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: BackendAuthResponse = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (result.error?.details && Array.isArray(result.error.details)) {
        const errorMessages = result.error.details.map((d: ValidationError) => d.message).join(', ');
        throw new Error(errorMessages || result.error?.message || 'Signup failed');
      }
      throw new Error(result.error?.message || result.message || 'Signup failed');
    }

    // Store token - check both locations
    const token = result.data?.token;
    if (token) {
      TokenManager.setToken(token);
    }

    // Normalize and store user
    let normalizedUser: User | undefined;
    if (result.data?.user) {
      normalizedUser = normalizeUser(result.data.user);
      TokenManager.setUser(normalizedUser);
    }

    return {
      success: result.success,
      message: result.message,
      data: normalizedUser,
      token,
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: BackendAuthResponse = await response.json();

    if (!response.ok) {
      if (result.error?.details && Array.isArray(result.error.details)) {
        const errorMessages = result.error.details.map((d: ValidationError) => d.message).join(', ');
        throw new Error(errorMessages || result.error?.message || 'Login failed');
      }
      throw new Error(result.error?.message || result.message || 'Login failed');
    }

    // Store token - check both locations
    const token = result.data?.token;
    if (token) {
      TokenManager.setToken(token);
    }

    // Normalize and store user
    let normalizedUser: User | undefined;
    if (result.data?.user) {
      normalizedUser = normalizeUser(result.data.user);
      TokenManager.setUser(normalizedUser);
    }

    return {
      success: result.success,
      message: result.message,
      data: normalizedUser,
      token,
    };
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    // First try to get cached user
    const cachedUser = TokenManager.getUser();
    
    // If no token, return cached user or throw
    if (!TokenManager.isAuthenticated()) {
      if (cachedUser) {
        return { success: true, data: cachedUser };
      }
      throw new Error('No authentication token found');
    }

    try {
      const authHeader = this.getAuthHeader();
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      });

      const result: BackendAuthResponse = await response.json();

      if (!response.ok) {
        // If token is invalid but we have cached user, return it
        if (cachedUser) {
          return { success: true, data: cachedUser };
        }
        throw new Error(result.error?.message || result.message || 'Failed to get user data');
      }

      // Normalize user
      let normalizedUser: User | undefined;
      if (result.data?.user) {
        normalizedUser = normalizeUser(result.data.user);
        TokenManager.setUser(normalizedUser);
      } else if (result.data && 'email' in result.data) {
        // Handle case where user is directly in data (not nested)
        normalizedUser = normalizeUser(result.data as unknown as BackendUser);
        TokenManager.setUser(normalizedUser);
      }

      return {
        success: result.success,
        message: result.message,
        data: normalizedUser,
      };
    } catch (error) {
      // If API call fails but we have cached user, return it
      if (cachedUser) {
        return { success: true, data: cachedUser };
      }
      throw error;
    }
  }

  static async logout(): Promise<AuthResponse> {
    try {
      if (TokenManager.isAuthenticated()) {
        const authHeader = this.getAuthHeader();
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
          },
        });
      }
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true, message: 'Logout successful' };
    } finally {
      // Always clear token on client side
      TokenManager.removeToken();
    }
  }
}
