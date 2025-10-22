export interface User {
  id: number;
  username: string;
  email?: string;
  is_staff: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  adminChecked: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAdminStatus: () => Promise<void>;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
}

export interface RegisterResponse {
  token: string;
  user_id: number;
  username: string;
}

export interface AdminResponse {
  is_admin: boolean;
  username: string;
  permissions: string;
}
