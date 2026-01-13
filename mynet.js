const { kord } = require(process.cwd() + "/core");
const os = require("os");

// Track messages processed
let totalMessages = 0;

kord(
  {
    cmd: "mynet",
    desc: "Check bot status like a pro",
    fromMe: false,
    type: "utility",
    onMessage: true // optional if you want to count every message
  },
  async (m) => {
    try {
      totalMessages++; // count messages processed

      const start = Date.now();
      const msg = await m.send("🏓 *Pinging...*");

      const latency = Date.now() - start;

      // Ping bar logic (5 bars)
      let bars = "";
      if (latency < 100) bars = "🟩🟩🟩🟩🟩";
      else if (latency < 200) bars = "🟩🟩🟩🟨🟨";
      else if (latency < 300) bars = "🟩🟩🟨🟨🟨";
      else if (latency < 400) bars = "🟨🟨🟨🟥🟥";
      else bars = "🟥🟥🟥🟥🟥"; 

      // Bot uptime
      const uptime = process.uptime(); // seconds
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      // Memory usage
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

      // Fancy ping reply
      const reply = `
╔════════════════════╗
       🏓 *PONG!*       
╠════════════════════╣
⏱ *Latency:* ${latency}ms ${bars}
⏳ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *RAM Usage:* ${memoryUsage} MB
🖥 *OS:* ${os.type()} ${os.arch()}
📝 *Total Messages:* ${totalMessages}
╚════════════════════╝
`;

      await msg.edit(reply);
    } catch (err) {
      console.log(err);
      m.send("⚠️ Could not check ping!");
    }
  }
);