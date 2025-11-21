import { readFileSync } from 'fs';
import path from 'path';

const formatKey = (key: string) => key.replace(/\\n/g, '\n');

export function loadPrivateKey(): string {
  if (process.env.JWT_PRIVATE_KEY) {
    return formatKey(process.env.JWT_PRIVATE_KEY);
  }

  try {
    const p = process.env.JWT_PRIVATE_KEY_PATH || './secrets/jwt-private.pem';
    const absolutePath = path.resolve(process.cwd(), p);
    return readFileSync(absolutePath, 'utf8');
  } catch (error) {
    console.error('Could not load Private Key via ENV or File');
    throw error;
  }
}

export function loadPublicKey(): string {
  const envKey =
    process.env.AUTH_SERVICE_PUBLIC_KEY || process.env.JWT_PUBLIC_KEY;
  if (envKey) {
    return formatKey(envKey);
  }

  try {
    const p = process.env.JWT_PUBLIC_KEY_PATH || './secrets/jwt-public.pem';
    const absolutePath = path.resolve(process.cwd(), p);
    return readFileSync(absolutePath, 'utf8');
  } catch (error) {
    console.error('Could not load Public Key via ENV or File');
    throw error;
  }
}
