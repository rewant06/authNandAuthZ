export interface UserPayload {
  id: string;
  email: string;
  name: string | null;
  roles: { name: string }[];
}
