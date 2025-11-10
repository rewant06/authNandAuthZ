export interface User {
    id: string;
    email: string;
    name: string | null;
    roles: string[];
    permissions: string[];
    createdAt: string;
}
export type RegisterPayload = Pick<User, 'email' | 'name'> & {
    password: string;
};
export type LoginPayload = Pick<User, 'email'> & {
    password: string;
};
export interface LoginResponse {
    accessToken: string;
    user: User;
}
export interface RefreshResponse {
    accessToken: string;
}
export interface JwtPayload {
    sub: string;
    jti: string;
    roles: string[];
    permissions: string[];
    iat: number;
    exp: number;
}
export interface ForgotPasswordPayload {
    email: string;
}
export interface ResetPasswordPayload {
    token: string;
    password: string;
}
export interface UpdateProfilePayload {
    name?: string;
}
