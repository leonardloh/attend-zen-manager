import http from 'http';
import { createAdminUsersHandler } from './adminUsersHandler';

const PORT = Number(process.env.ADMIN_USERS_PORT || 8787);

const handler = createAdminUsersHandler({
  cors: true,
});

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('missing url');
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (!['/admin-users', '/admin-users/'].includes(url.pathname)) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }

  const chunks: Buffer[] = [];
  req.on('data', (chunk) => chunks.push(chunk));

  req.on('end', async () => {
    const body = chunks.length > 0 ? Buffer.concat(chunks).toString('utf8') : undefined;

    const response = await handler({
      method: req.method || 'GET',
      headers: req.headers as Record<string, string>,
      query: Object.fromEntries(url.searchParams.entries()),
      body,
    });

    res.statusCode = response.status;
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.setHeader(key, value);
        }
      });
    }
    res.end(response.body ?? '');
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Admin users server listening on http://localhost:${PORT}`);
  });
}

export default server;
