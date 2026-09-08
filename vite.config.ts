import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function phpApiDevPlugin(): Plugin {
  let memoryData: Record<string, any> = {};

  return {
    name: 'php-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Intercept PHP API endpoints in dev mode
        if (url.startsWith('/api/')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', () => {
            let parsedBody: Record<string, any> = {};
            if (body) {
              try {
                parsedBody = JSON.parse(body);
              } catch {
                parsedBody = {};
              }
            }

            // 1. /api/login.php
            if (url.includes('/api/login.php')) {
              const email = (parsedBody.email || '').toLowerCase().trim();
              const password = (parsedBody.password || '').trim();

              const isValidUser =
                email === 'admin@karlpeacelegacy.org' ||
                email === 'admin' ||
                email === 'gtech.websites@gmail.com' ||
                email.endsWith('@karlpeacelegacy.org');

              const isPasswordValid =
                password === 'admin' ||
                password === 'karlpeace2026' ||
                password === 'admin123';

              if (isValidUser && isPasswordValid) {
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'Authentication successful via PHP backend.',
                    token: 'karl_php_token_' + Date.now(),
                    user: {
                      uid: 'php_' + (email === 'admin' ? 'admin' : email),
                      email: email === 'admin' ? 'admin@karlpeacelegacy.org' : email,
                      displayName: 'Karl Peace Foundation Admin',
                      role: 'admin',
                      isSuperAdmin: true,
                    },
                  })
                );
              } else {
                res.statusCode = 401;
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Invalid administrative credentials. Default is admin@karlpeacelegacy.org and password is admin.',
                  })
                );
              }
              return;
            }

            // 2. /api/data.php
            if (url.includes('/api/data.php')) {
              if (req.method === 'GET') {
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    source: 'php_api_simulator',
                    data: memoryData,
                  })
                );
                return;
              }

              if (req.method === 'POST' || req.method === 'PUT') {
                memoryData = { ...memoryData, ...parsedBody };
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    success: true,
                    message: 'Data successfully synchronized with PHP backend.',
                    timestamp: new Date().toISOString(),
                    data: memoryData,
                  })
                );
                return;
              }
            }

            // 3. /api/subscribers.php
            if (url.includes('/api/subscribers.php')) {
              if (req.method === 'POST') {
                const sub = {
                  id: 'sub_' + Date.now(),
                  name: parsedBody.name || 'Scholar Applicant',
                  email: parsedBody.email || '',
                  institution: parsedBody.institution || '',
                  course: parsedBody.course || '',
                  createdAt: new Date().toISOString(),
                  status: 'new',
                };
                if (!memoryData.subscribers) memoryData.subscribers = [];
                memoryData.subscribers.unshift(sub);
                res.statusCode = 201;
                res.end(JSON.stringify({ success: true, item: sub }));
                return;
              }
            }

            // 4. /api/inquiries.php
            if (url.includes('/api/inquiries.php')) {
              if (req.method === 'POST') {
                const inq = {
                  id: 'inq_' + Date.now(),
                  name: parsedBody.name || '',
                  email: parsedBody.email || '',
                  subject: parsedBody.subject || 'General Inquiry',
                  message: parsedBody.message || '',
                  createdAt: new Date().toISOString(),
                  status: 'unread',
                };
                if (!memoryData.inquiries) memoryData.inquiries = [];
                memoryData.inquiries.unshift(inq);
                res.statusCode = 201;
                res.end(JSON.stringify({ success: true, item: inq }));
                return;
              }
            }

            // 5. /api/check-auth.php
            if (url.includes('/api/check-auth.php')) {
              const authHeader = req.headers['authorization'] || '';
              const isAuthed = authHeader.includes('karl_php_token_');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  authenticated: isAuthed,
                  user: isAuthed ? {
                    uid: 'php_admin',
                    email: 'admin@karlpeacelegacy.org',
                    displayName: 'Karl Peace Foundation Admin',
                    role: 'admin',
                    isSuperAdmin: true,
                  } : null
                })
              );
              return;
            }

            // 6. /api/logout.php
            if (url.includes('/api/logout.php')) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, message: 'Logged out successfully.' }));
              return;
            }

            // 7. /api/export.php
            if (url.includes('/api/export.php')) {
              res.setHeader('Content-Disposition', 'attachment; filename="karl_peace_foundation_backup.json"');
              res.statusCode = 200;
              res.end(JSON.stringify(memoryData, null, 2));
              return;
            }

            // 8. /api/upload.php
            if (url.includes('/api/upload.php')) {
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Image uploaded successfully.',
                  url: ''
                })
              );
              return;
            }

            next();
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), phpApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
