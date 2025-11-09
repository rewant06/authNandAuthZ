import { readFileSync } from 'fs';
import path from 'path';

export function loadPrivateKey(): string {
  if (process.env.JWT_PRIVATE_KEY) return process.env.JWT_PRIVATE_KEY;
  const p = process.env.JWT_PRIVATE_KEY_PATH || './secrets/jwt-private.pem';
  const absolutePath = path.resolve(process.cwd(), p);
  return readFileSync(absolutePath, 'utf8');
}

export function loadPublicKey(): string {
  if (process.env.JWT_PUBLIC_KEY) return process.env.JWT_PUBLIC_KEY;
  const p = process.env.JWT_PUBLIC_KEY_PATH || './secrets/jwt-public.pem';
  const absolutePath = path.resolve(process.cwd(), p);
  return readFileSync(absolutePath, 'utf8');
}
