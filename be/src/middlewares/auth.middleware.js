import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();
const KEYCLOAK_REALM_URL = process.env.KEYCLOAK_REALM_URL;

const client = jwksClient({
  jwksUri: `${KEYCLOAK_REALM_URL}/protocol/openid-connect/certs`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware Utama: Verifikasi Token dan Ekstraksi User Data
export const protect = (req, res, next) => { // <-- Export style changed
  let token;
  // ... (Logika Verifikasi Token sama seperti sebelumnya) ...
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Akses Ditolak. Token tidak ditemukan.' });
  }

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error('Verifikasi Token Gagal:', err);
      return res.status(401).json({ error: 'Akses Ditolak. Token tidak valid.' });
    }

    const roles = decoded.realm_access?.roles || [];
    
    req.user = {
      id: decoded.sub, 
      username: decoded.preferred_username,
      email: decoded.email, 
      roles: roles,
    };
    
    next();
  });
};

// Middleware Otorisasi: Menegakkan Peran
export const authorize = (allowedRoles) => (req, res, next) => { // <-- Export style changed
  if (!req.user || !req.user.roles) {
    return res.status(500).json({ error: 'Kesalahan Server: Pengguna tidak terautentikasi.' });
  }
  
  const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

  if (hasRole) {
    next();
  } else {
    res.status(403).json({ error: 'Akses Ditolak. Anda tidak memiliki izin untuk operasi ini.' });
  }
};