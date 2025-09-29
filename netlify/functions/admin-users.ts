import type { Handler } from '@netlify/functions';
import { createAdminUsersHandler } from '../../server/adminUsersHandler';

const adminUsersHandler = createAdminUsersHandler();

export const handler: Handler = async (event) => {
  const response = await adminUsersHandler({
    method: event.httpMethod,
    headers: event.headers,
    query: event.queryStringParameters,
    body: event.body,
  });

  return {
    statusCode: response.status,
    headers: response.headers,
    body: response.body,
  };
};
