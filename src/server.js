const { createServer } = require('node:http');
const { env, prisma } = require('./config');
const { createApp } = require('./app');
const { attachChat } = require('./chat');

async function main() {
  await prisma.$connect();
  const server = createServer(createApp());
  const io = attachChat(server);
  server.listen(env.PORT, '0.0.0.0', () => console.log('Blog API listening on port ' + env.PORT));

  function stop() {
    io.close().finally(() => prisma.$disconnect());
  }
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
}

main().catch(async (error) => {
  console.error(error.message);
  await prisma.$disconnect();
  process.exitCode = 1;
});
