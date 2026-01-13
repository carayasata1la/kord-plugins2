const { kord } = require(process.cwd() + "/core");
const fs = require("fs");
const path = process.cwd() + "/memory_infinitybuddy.json";

// ---------------- MEMORY ----------------
let memory = {};
if (fs.existsSync(path)) memory = JSON.parse(fs.readFileSync(path));
else fs.writeFileSync(path, JSON.stringify(memory, null, 2));

function saveMemory() {
  fs.writeFileSync(path, JSON.stringify(memory, null, 2));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseTime(time) {
  if (!time) return null;
  const match = time.match(/^(\d+)(s|m)$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  return match[2] === "s" ? value * 1000 : value * 60000;
}

// ---------------- DYNAMIC CONTENT ----------------
function generateJoke() {
  const subjects = ["Cat", "Dog", "Chicken", "Man", "Woman", "Boy", "Girl"];
  const verbs = ["waka", "run", "jump", "sleep", "cry", "dance", "chase"];
  const extras = ["for road", "inside house", "for market", "on top roof", "under tree"];
  return `😂 ${randomItem(subjects)} ${randomItem(verbs)} ${randomItem(extras)}!`;
}

function generateStory() {
  const subjects = ["One boy", "One girl", "One man", "One woman", "Peter", "Sarah"];
  const verbs = ["waka enter", "run enter", "fall inside", "see", "meet", "find"];
  const objects = ["market", "forest", "river", "house", "park", "school"];
  const endings = ["and everybody laugh 😆", "and e shock well well 😱", "and e happy pass everybody 😎", "and wahala happen 😅"];
  return `${randomItem(subjects)} ${randomItem(verbs)} ${randomItem(objects)}, ${randomItem(endings)}`;
}

function generateQuote() {
  const intros = ["💡 Remember:", "🌟 Advice:", "🔥 Tip:", "🧘 Wisdom:"];
  const messages = [
    "Small small progress na better pass zero",
    "Patience dey always bring better result",
    "Work dey pay for person wey no dey slack",
    "Believe yourself, nobody fit do your work for you",
    "Joy dey everywhere if you fit notice am",
    "Mistakes na teacher, not enemy",
    "Success dey inside small consistent action",
    "Relax today, work well tomorrow",
    "Keep pushing, the best dey ahead",
    "Every day na new chance to shine"
  ];
  return `${randomItem(intros)} ${randomItem(messages)}`;
}

// ---------------- TYPING SIMULATION ----------------
async function typingSend(m, text) {
  const ms = 1000 + Math.floor(Math.random() * 2000);
  await delay(ms);
  return m.send(text);
}

// ---------------- SAFE MATH ----------------
function safeEval(expr) {
  try {
    const result = Function(`"use strict";return (${expr})`)();
    return result;
  } catch {
    return null;
  }
}

// ---------------- DICE ----------------
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// ---------------- FAKE WEATHER ----------------
function fakeWeather(city) {
  const temp = 25 + Math.floor(Math.random() * 10);
  return `🌤 ${city} dey ${temp}°C today`;
}

// ---------------- CORE BUDDY COMMAND ----------------
kord(
  {
    cmd: "buddy",
    desc: "Infinity Buddy Pro Max 😎",
    fromMe: false,
    type: "fun"
  },
  async (m, text) => {
    const userId = m.sender;
    if (!memory[userId]) memory[userId] = {
      name: null,
      favorite: null,
      hobbies: [],
      mood: "neutral",
      xp: 0,
      level: 1,
      reminders: [],
      game: {},
      lastMessages: [],
      chatMode: true
    };

    const msg = text?.toLowerCase();
    const user = memory[userId];

    if (!text) return typingSend(m, "🙂 I dey here oh, wetin dey happen? Use `.buddy help` to see commands.");

    // ---------------- XP & LEVEL ----------------
    user.xp += 10;
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      await typingSend(m, `🎉 Omo! You don level up! You don reach Level ${user.level} 😎`);
    }

    // Remember last messages
    if (!user.lastMessages) user.lastMessages = [];
    user.lastMessages.push(msg);
    if (user.lastMessages.length > 3) user.lastMessages.shift();

    // ---------------- HELP ----------------
    if (msg === "help") {
      return typingSend(m, `
📜 Buddy Infinity Commands:

👤 Personal Info:
.name <name>
.favorite <thing>
.hobby <thing>
.info
.mood <happy/sad/angry> / .mood

⏰ Reminders:
.remind <10s/5m> <task>
.reminders
.delreminder <number>

😂 Fun & Chat:
.joke
.advice
.riddle
.story
.daily
.translate <text>
.weather <city>
.insult <name>
.compliment <name>
.chatmode <on/off>

🎲 Games:
.rps <rock/paper/scissors>
.coin
.guess <1-20>
.trivia
.answer <text>
.roll
.math <expression>

🔎 Stats & Features:
.stats
.features

🫥 Secret:
.secret
`);
    }

    // ---------------- SURPRISE ----------------
    if (msg === "secret") {
      user.xp += 100;
      saveMemory();
      return typingSend(m, "🫥 Chai! You find me… Secret XP +100 😏");
    }

    // ---------------- PERSONAL INFO ----------------
    if (msg.startsWith("name ")) { user.name = text.slice(5).trim(); saveMemory(); return typingSend(m, `✅ I go dey call you ${user.name}`); }
    if (msg.startsWith("favorite ")) { user.favorite = text.slice(9).trim(); saveMemory(); return typingSend(m, `🎉 I don remember say your favorite na ${user.favorite}`); }
    if (msg.startsWith("hobby ")) { const h = text.slice(6).trim(); user.hobbies.push(h); saveMemory(); return typingSend(m, `✅ I don add hobby: ${h}`); }
    if (msg === "info") return typingSend(m, `📋 Info:\nName: ${user.name || "N/A"}\nFavorite: ${user.favorite || "N/A"}\nHobbies: ${user.hobbies.join(", ") || "N/A"}\nMood: ${user.mood}\nLevel: ${user.level}\nXP: ${user.xp}`);

    // ---------------- MOOD ----------------
    if (msg.startsWith("mood ")) { user.mood = text.slice(5).trim(); saveMemory(); return typingSend(m, `🙂 Mood set to "${user.mood}"`); }
    if (msg === "mood") return typingSend(m, `🙂 Your last mood na "${user.mood}"`);

    // ---------------- REMINDERS ----------------
    if (msg.startsWith("remind ")) {
      const parts = text.slice(7).trim().split(" ");
      const delayTime = parseTime(parts[0]);
      const task = parts.slice(1).join(" ");
      if (!delayTime || !task) return typingSend(m, "❌ Wrong usage! Example: `.buddy remind 10s Drink water`");
      const reminder = { task, time: Date.now() + delayTime };
      user.reminders.push(reminder);
      saveMemory();
      setTimeout(async () => { try { await typingSend(m, `🔔 Reminder: "${task}"`); user.reminders = user.reminders.filter(r => r !== reminder); saveMemory(); } catch(e){} }, delayTime);
      return typingSend(m, `⏳ Reminder set: "${task}" for ${parts[0]}`);
    }

    if (msg === "reminders") {
      if (!user.reminders.length) return typingSend(m, "📭 You no get active reminder");
      let list = "⏳ Your reminders:\n";
      user.reminders.forEach((r,i)=>{ const rem = Math.max(0,Math.round((r.time-Date.now())/1000)); list += `${i+1}. ${r.task} - ${rem}s left\n`; });
      return typingSend(m, list);
    }

    if (msg.startsWith("delreminder ")) {
      const num = parseInt(msg.split(" ")[1]);
      if (isNaN(num) || num<1 || num>user.reminders.length) return typingSend(m, "❌ Wrong usage!");
      const removed = user.reminders.splice(num-1,1);
      saveMemory();
      return typingSend(m, `✅ Removed reminder: ${removed[0].task}`);
    }

    // ---------------- FUN ----------------
    if (msg.includes("joke")) return typingSend(m, generateJoke());
    if (msg.includes("advice")) return typingSend(m, generateQuote());
    if (msg === "story") return typingSend(m, generateStory());

    // ---------------- MINI-GAMES ----------------
    if (msg.startsWith("rps ")) {
      const choice = msg.split(" ")[1];
      const valid = ["rock","paper","scissors"];
      if (!valid.includes(choice)) return typingSend(m,"❌ Invalid choice!");
      const bot = randomItem(valid);
      let res = "";
      if (choice === bot) res="🤝 Tie!";
      else if ((choice==="rock"&&bot==="scissors")||(choice==="paper"&&bot==="rock")||(choice==="scissors"&&bot==="paper")) res="🎉 You win!";
      else res="😢 You lose!";
      return typingSend(m, `You: ${choice}\nMe: ${bot}\n${res}`);
    }

    if (msg === "coin") return typingSend(m, `🪙 Coin: ${Math.random()<0.5?"Heads":"Tails"}`);
    if (msg.startsWith("guess ")) { const guess = parseInt(msg.split(" ")[1]); const number = Math.floor(Math.random()*20)+1; if(guess===number){user.xp+=15; saveMemory(); return typingSend(m,`🎉 Correct! Number na ${number}. +15 XP`);} else if(guess<number) return typingSend(m,"📈 Too small!"); else return typingSend(m,"📉 Too high!"); }
    if (msg === "roll") return typingSend(m, `🎲 You roll: ${rollDice()}`);
    if (msg.startsWith("math ")) { const expr = text.slice(5).trim(); const res = safeEval(expr); return res===null?typingSend(m,"❌ Invalid math"):typingSend(m,`🧮 Result: ${res}`); }

    // ---------------- STATS ----------------
    if (msg === "stats") return typingSend(m, `📊 Stats:\nXP: ${user.xp}\nLevel: ${user.level}\nMood: ${user.mood}`);
    if (msg === "features") return typingSend(m, `✨ Buddy Infinity Features:\n- Infinite jokes/stories/quotes\n- Mood system\n- Mini-games\n- Reminders\n- Levels & XP\n- Chat mode\n- Surprise Easter egg 🫥`);

    // ---------------- MOOD CHECK ----------------
    if (msg === "moodcheck") {
      const suggestions = { happy:["Dance","Play music"], sad:["Rest","Talk to friend"], angry:["Count 10","Deep breath"], neutral:["Chill","Read"] };
      return typingSend(m, `🤔 Based on mood "${user.mood}", try: ${randomItem(suggestions[user.mood]||["Relax"])}`);
    }

    // ---------------- FACTS ----------------
    if (msg === "facts") {
      const facts = ["💡 Honey dey never spoil","💡 Lightning fit strike same place twice","💡 Octopus get 3 hearts","💡 Banana na berry","💡 Turtle fit breathe thru butt"];
      return typingSend(m, randomItem(facts));
    }

    // ---------------- FALLBACK CHAT ----------------
    if (user.chatMode) {
      const responses = ["😎 I dey hear you oh","😂 Chai, that one sweet me","🤔 I dey think about wetin you talk","😆 Wahala dey but we go manage","😄 Na true you talk!"];
      return typingSend(m, randomItem(responses));
    }

    // ---------------- IF NOTHING MATCH ----------------
    return typingSend(m,"❌ I no understand that. Use `.buddy help` to see commands");
  }
);