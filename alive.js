const { kord } = require(process.cwd() + "/core");

kord({
  cmd: "ping",
  desc: "Check bot speed",
  fromMe: false,
  type: "general"
}, async (m) => {
  const start = Date.now();
  const msg = await m.send("🏓 Pinging...");
  const ping = Date.now() - start;

  await msg.edit(`🏓 Pong!\n⚡ Speed: *${ping}ms*`);
});
)