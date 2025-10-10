import type { Express } from "express";
import { createServer, type Server } from "http";
import { createAdminUsersHandler } from "./adminUsersHandler";
import { createUserManagementHandler } from "./userManagementHandler";

export function registerRoutes(app: Express): Server {
  // Admin users endpoint
  const adminHandler = createAdminUsersHandler({ cors: true });
  
  app.all("/api/admin-users", async (req, res) => {
    const response = await adminHandler({
      method: req.method,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    res.status(response.status);
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value) res.setHeader(key, value);
      });
    }
    res.send(response.body);
  });

  // User management endpoint
  const userMgmtHandler = createUserManagementHandler({ cors: true });
  
  app.all("/api/user-management", async (req, res) => {
    const response = await userMgmtHandler({
      method: req.method,
      headers: req.headers as Record<string, string>,
      query: req.query as Record<string, string>,
      body: req.body ? JSON.stringify(req.body) : undefined,
    });

    res.status(response.status);
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value) res.setHeader(key, value);
      });
    }
    res.send(response.body);
  });

  const httpServer = createServer(app);
  return httpServer;
}
