
// --- Pagination Types ---

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  lastPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// --- User Types ---

export interface Role {
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  roles: Role[];
  isEmailVerified?: boolean;
  // permissions: string[];
  createdAt: string;
  updatedAt?: string;

}

// --- Activity Log Types ---
export interface ActivityLogActorSnapshot {
  email: string;
  roles: { name: string }[];
}

export interface ActivityLogContext {
  ip?: string;
  userAgent?: string;
  [key: string]: unknown; // Allow other context properties
}

export type ActivityLogChanges = Record<string, any>;

export interface ActivityLog {
  id: string;
  actorId: string | null;
  actorSnapshot: ActivityLogActorSnapshot | null;
  actionType: string;
  status: string;
  entityType: string;
  entityId: string | null;
  changes: ActivityLogContext | null;
  context: ActivityLogContext | null;
  createdAt: string;
  failureReason: string | null;
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
  name: string;
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

}

