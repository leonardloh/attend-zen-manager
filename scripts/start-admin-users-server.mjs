import 'ts-node/register';
import server from '../server/adminUsersServer.ts';

const PORT = Number(process.env.ADMIN_USERS_PORT || 8787);

server.listen(PORT, () => {
  console.log(`Admin users server listening on http://localhost:${PORT}`);
});
