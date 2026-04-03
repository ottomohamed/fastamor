import crypto from 'crypto';

export function generateAviasalesSignature(
  token: string, 
  marker: string, 
  params: Record<string, any>
): string {
  const sortedKeys = Object.keys(params).sort();
  const values = [token, marker];
  
  for (const key of sortedKeys) {
    let value = params[key];
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    values.push(String(value));
  }
  
  const signatureString = values.join(':');
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

export function getUserIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '0.0.0.0';
}
