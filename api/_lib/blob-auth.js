// Credentials for the private Vercel Blob store "fastamor-media".
// The store is connected with OIDC: the store id is in BLOB_STORE_ID and Vercel
// passes a short-lived OIDC token to each function call in a request header.
export function blobAuth(req) {
  const oidcToken = req.headers['x-vercel-oidc-token'] || process.env.VERCEL_OIDC_TOKEN;
  const storeId = process.env.BLOB_STORE_ID;
  if (process.env.BLOB_READ_WRITE_TOKEN) return { token: process.env.BLOB_READ_WRITE_TOKEN };
  return oidcToken && storeId ? { oidcToken, storeId } : null;
}
