import { UAParser } from 'ua-parser-js';

export function parseDeviceInfo(req: any) {
  const ua = req.headers?.['user-agent'] ?? '';
  const parser = new UAParser(String(ua));
  const result = parser.getResult();
  const deviceName = [result.browser.name, result.os.name]
    .filter(Boolean)
    .join('/');

  const ip =
    (req.headers &&
      (req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress)) ||
    req.ip;

  return { userAgent: ua, ip: String(ip ?? ''), deviceName };
}
