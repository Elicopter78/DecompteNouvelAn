const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const rateLimitWindowMs = 60 * 1000;
const maxRequestsPerWindow = 60;
const requestCounts = new Map();

app.disable('x-powered-by');

app.use((req, res, next) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const isSecureRequest = req.secure || forwardedProto === 'https';

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' data:; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (process.env.NODE_ENV === 'production' && !isSecureRequest) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = requestCounts.get(clientIp);

  if (!current || now - current.windowStart >= rateLimitWindowMs) {
    requestCounts.set(clientIp, { count: 1, windowStart: now });
    return next();
  }

  if (current.count >= maxRequestsPerWindow) {
    return res.status(429).json({ error: 'Too many requests, please retry later.' });
  }

  current.count += 1;
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  maxAge: '1h',
}));

const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  const envContents = fs.readFileSync(envFile, 'utf8');
  for (const line of envContents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] in process.env) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const visitorsFile = path.join(__dirname, 'visitors.json');

function writeVisitorsFile(visitors) {
  const tempFile = `${visitorsFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(visitors));
  fs.renameSync(tempFile, visitorsFile);
}

if (!fs.existsSync(visitorsFile)) {
  writeVisitorsFile({ count: 0 });
}

app.set('trust proxy', 1);

app.get('/api/visitors', (req, res) => {
  try {
    const data = fs.readFileSync(visitorsFile, 'utf8');
    const visitors = JSON.parse(data);
    if (!Number.isInteger(visitors.count) || visitors.count < 0) {
      visitors.count = 0;
    }

    const hasVisitorCookie = (req.headers.cookie || '')
      .split(';')
      .some(cookie => cookie.trim().startsWith('countdown_visitor='));

    if (!hasVisitorCookie) {
      visitors.count += 1;
      writeVisitorsFile(visitors);

      const isSecureRequest = req.secure || req.headers['x-forwarded-proto'] === 'https';
      res.cookie('countdown_visitor', '1', {
        maxAge: 31536000 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: isSecureRequest,
        path: '/',
      });
    }

    res.set('Cache-Control', 'no-store');
    res.json({ count: visitors.count });
  } catch (error) {
    console.error('Error reading/writing visitors file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`App running at http://localhost:${PORT}`);
});
