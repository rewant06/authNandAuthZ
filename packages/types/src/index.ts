// --- User Types ---

export interface User {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
  createdAt: string;
  isEmailVerified?: boolean;
}

// --- Auth Payloads ---

export type RegisterPayload = Pick<User, 'email' | 'name'> & {
  password: string;
};

export type LoginPayload = Pick<User, 'email'> & {
  password: string;
};

// --- Auth Responses ---

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

// --- JWT "Smart" Token Payload ---

export interface JwtPayload {
  sub: string; // User ID
  jti: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// --- Password Reset Payloads ---

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// --- User API Payloads ---

export interface UpdateProfilePayload {
  name?: string;
  // Add other updatable fields here, e.g., avatarUrl
}

