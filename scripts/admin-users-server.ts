import express, { Request, Response } from 'express';
import cors from 'cors';
import { createAdminUsersHandler } from '../server/adminUsersHandler';

const PORT = Number(process.env.ADMIN_USERS_PORT || 8787);

const app = express();
app.use(cors());
app.use(express.json());

const handler = createAdminUsersHandler({
  cors: true,
});

app.get('/admin-users', async (req: Request, res: Response) => {
  const response = await handler({
    method: req.method,
    headers: req.headers as Record<string, string>,
    query: req.query as Record<string, string>,
  });
  res.status(response.status).set(response.headers ?? {}).send(response.body ?? '');
});

app.put('/admin-users', async (req: Request, res: Response) => {
  const response = await handler({
    method: req.method,
    headers: req.headers as Record<string, string>,
    query: req.query as Record<string, string>,
    body: JSON.stringify(req.body ?? {}),
  });
  res.status(response.status).set(response.headers ?? {}).send(response.body ?? '');
});

app.options('/admin-users', async (req: Request, res: Response) => {
  const response = await handler({
    method: req.method,
    headers: req.headers as Record<string, string>,
  });
  res.status(response.status).set(response.headers ?? {}).send(response.body ?? '');
});

app.listen(PORT, () => {
  console.log(`Admin users server listening on http://localhost:${PORT}`);
});
