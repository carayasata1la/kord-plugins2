const { kord } = require(process.cwd() + "/core");
const fs = require("fs");
const path = process.cwd() + "/memory_probuddy_plus.json";

// Load or initialize memory
let memory = {};
if (fs.existsSync(path)) {
  memory = JSON.parse(fs.readFileSync(path));
} else {
  fs.writeFileSync(path, JSON.stringify(memory, null, 2));
}

// Save memory
function saveMemory() {
  fs.writeFileSync(path, JSON.stringify(memory, null, 2));
}

// Helper: random item
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Parse time like 10s or 5m
function parseTime(time) {
  if (!time) return null;
  const match = time.match(/^(\d+)(s|m)$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  return match[2] === "s" ? value * 1000 : value * 60000;
}

kord(
  {
    cmd: "buddy",
    desc: "Pro Buddy with mood, reminders, XP, games, and chat",
    fromMe: false,
    type: "fun"
  },
  async (m, text) => {
    const userId = m.sender;
    if (!memory[userId])
      memory[userId] = {
        name: null,
        favorite: null,
        hobbies: [],
        lastMessage: null,
        mood: null,
        xp: 0,
        reminders: []
      };

    if (!text) return m.send("🙂 Hey! I’m your Pro Buddy. Use `.buddy help` for commands.");

    const msg = text.toLowerCase();
    const user = memory[userId];

    // Increment XP per message
    user.xp += 5;

    // Commands
    if (msg === "help") {
      return m.send(`📜 Pro Buddy Commands:
1️⃣ .buddy name <your name>
2️⃣ .buddy favorite <thing>
3️⃣ .buddy hobby <thing>
4️⃣ .buddy info
5️⃣ .buddy mood <mood> / .buddy mood
6️⃣ .buddy remind <time> <task>
7️⃣ .buddy reminders
8️⃣ .buddy delreminder <number>
9️⃣ .buddy joke
🔟 .buddy advice
1️⃣1️⃣ .buddy rps <rock/paper/scissors>
1️⃣2️⃣ .buddy coin
1️⃣3️⃣ .buddy stats`);
    }

    // Set name
    if (msg.startsWith("name ")) {
      const name = text.slice(5).trim();
      user.name = name;
      saveMemory();
      return m.send(`✅ Got it! I’ll call you ${name}`);
    }

    // Set favorite
    if (msg.startsWith("favorite ")) {
      const fav = text.slice(9).trim();
      user.favorite = fav;
      saveMemory();
      return m.send(`🎉 Cool! I’ll remember your favorite thing is ${fav}`);
    }

    // Add hobby
    if (msg.startsWith("hobby ")) {
      const hobby = text.slice(6).trim();
      user.hobbies.push(hobby);
      saveMemory();
      return m.send(`✅ Added hobby: ${hobby}`);
    }

    // Info
    if (msg === "info") {
      return m.send(`📋 Your info:
Name: ${user.name || "N/A"}
Favorite: ${user.favorite || "N/A"}
Hobbies: ${user.hobbies.join(", ") || "N/A"}
Mood: ${user.mood || "N/A"}
Last message: ${user.lastMessage || "N/A"}`);
    }

    // Mood
    if (msg.startsWith("mood ")) {
      const mood = text.slice(5).trim();
      user.mood = mood;
      saveMemory();
      return m.send(`🙂 Mood set to "${mood}"`);
    }
    if (msg === "mood") {
      return m.send(`🙂 Your last mood: "${user.mood || "N/A"}"`);
    }

    // Reminders
    if (msg.startsWith("remind ")) {
      const parts = text.slice(7).trim().split(" ");
      const delay = parseTime(parts[0]);
      const task = parts.slice(1).join(" ");
      if (!delay || !task) return m.send("❌ Usage: .buddy remind 10s Drink water");

      const reminder = { task, time: Date.now() + delay };
      user.reminders.push(reminder);
      saveMemory();

      // Schedule reminder
      setTimeout(async () => {
        try {
          await m.send(`🔔 Reminder: "${task}"`);
          user.reminders = user.reminders.filter(r => r !== reminder);
          saveMemory();
        } catch (e) {}
      }, delay);

      return m.send(`⏳ Reminder set for "${task}" in ${parts[0]}`);
    }

    if (msg === "reminders") {
      if (!user.reminders.length) return m.send("📭 No active reminders");
      let list = "⏳ Your reminders:\n";
      user.reminders.forEach((r, i) => {
        const remaining = Math.max(0, Math.round((r.time - Date.now()) / 1000));
        list += `${i + 1}. ${r.task} - ${remaining}s left\n`;
      });
      return m.send(list);
    }

    if (msg.startsWith("delreminder ")) {
      const num = parseInt(msg.split(" ")[1]);
      if (isNaN(num) || num < 1 || num > user.reminders.length)
        return m.send("❌ Invalid reminder number");
      const removed = user.reminders.splice(num - 1, 1);
      saveMemory();
      return m.send(`✅ Removed reminder: ${removed[0].task}`);
    }

    // Jokes
    if (msg.includes("joke")) {
      const jokes = [
        "😂 Why did the phone go to school? To improve its class.",
        "🤣 I tried coding without bugs… then I woke up.",
        "😆 Why do programmers love dark mode? Because light attracts bugs!"
      ];
      return m.send(randomItem(jokes));
    }

    // Advice
    if (msg.includes("advice")) {
      const advices = [
        "💡 Keep learning every day!",
        "💪 Don’t give up, even if it’s tough.",
        "🌟 Focus on small wins, they add up.",
        "🧘‍♂️ Take breaks, mental health is key."
      ];
      return m.send(randomItem(advices));
    }

    // Games
    if (msg.startsWith("rps ")) {
      const choice = msg.split(" ")[1];
      const valid = ["rock", "paper", "scissors"];
      if (!valid.includes(choice)) return m.send("❌ Choose rock, paper, or scissors");
      const botChoice = randomItem(valid);
      let result = "";
      if (choice === botChoice) result = "🤝 Tie!";
      else if (
        (choice === "rock" && botChoice === "scissors") ||
        (choice === "paper" && botChoice === "rock") ||
        (choice === "scissors" && botChoice === "paper")
      ) result = "🎉 You win!";
      else result = "😢 You lose!";
      return m.send(`You: ${choice}\nMe: ${botChoice}\n${result}`);
    }

    if (msg === "coin") {
      return m.send(`🪙 Coin flip: ${Math.random() < 0.5 ? "Heads" : "Tails"}`);
    }

    // Stats
    if (msg === "stats") {
      return m.send(`📊 Your stats:
XP: ${user.xp}
Mood: ${user.mood || "N/A"}
Hobbies: ${user.hobbies.join(", ") || "N/A"}
Favorite: ${user.favorite || "N/A"}`);
    }

    // Personalized chat fallback
    let reply = `🙂 I’m listening${user.name ? ", " + user.name : ""}…`;
    if (user.favorite && msg.includes("what do you think")) {
      reply = `😎 I know you love ${user.favorite}, so that’s awesome!`;
    }

    // Save last message & memory
    user.lastMessage = text;
    saveMemory();

    return m.send(reply);
  }
);