const { kord } = require(process.cwd() + "/core");
const fs = require("fs");
const path = process.cwd() + "/memory_probuddy_ultimate.json";

// Load memory
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

// Trivia questions
const trivia = [
  { q: "Capital of France?", a: "paris" },
  { q: "2 + 2 * 2?", a: "6" },
  { q: "The largest planet?", a: "jupiter" },
];

// Pidgin jokes
const jokes = [
  "😂 Why e phone waka go school? To sabi class better.",
  "🤣 I try code without bug… I just wake up.",
  "😆 Why programmers dey love dark mode? Light dey attract bug!",
  "🤣 Why mosquito no dey pay rent? Because e dey free!",
  "😂 I tell my dog small secret… e no fit keep am 😆",
  "🤣 Why market woman no dey play hide and seek? Because e dey shout price!",
  "😂 Why chicken waka cross road? To reach the other side 😎",
  "🤣 Why laptop dey cold? Because e get fan inside!",
  "😆 I tell my cat 'You go chop now'… e just look me like say I craze 😹",
  "🤣 Why bank no dey give mosquito loan? Because e no get ID!",
];

// Pidgin motivational quotes
const quotes = [
  "💡 If today hard, tomorrow go easy, just hold on.",
  "💪 Small small progress na better pass zero.",
  "🌟 Work dey pay for person wey no dey slack.",
  "🧘‍♂️ Take rest, your mind go fresh to perform.",
  "🔥 Believe yourself, nobody fit do your work for you.",
];

// Riddles
const riddles = [
  { q: "I get keys but I no fit open door. Wetin I be?", a: "piano" },
  { q: "What dey always dey run but e no dey waka?", a: "water" },
  { q: "I dey full of holes but I dey hold water. Wetin I be?", a: "sponge" },
];

// Short stories
const stories = [
  "Once upon a time, one boy waka enter market, e see mango wey dey shine like gold…",
  "Omo, one man try catch cat wey dey run, e slip enter mud 😆…",
  "Ahhh, one lady teach me say small small savings dey grow like tree 🌳…",
];

// Chat mode default
const chatModeDefault = true;

// Typing simulation
async function typingSend(m, text) {
  const ms = 1000 + Math.floor(Math.random() * 3000);
  await delay(ms);
  return m.send(text);
}

// Remember last 3 messages
function rememberMessage(user, msg) {
  if (!user.lastMessages) user.lastMessages = [];
  user.lastMessages.push(msg);
  if (user.lastMessages.length > 3) user.lastMessages.shift();
}

// Safe math eval
function safeEval(expr) {
  try {
    const result = Function(`"use strict";return (${expr})`)();
    return result;
  } catch {
    return null;
  }
}

// Fake weather info
function fakeWeather(city) {
  const temp = 25 + Math.floor(Math.random() * 10);
  return `🌤 ${city} dey ${temp}°C today`;
}

// Roll dice
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// Core Buddy command
kord(
  {
    cmd: "buddy",
    desc: "Pro Buddy Max Ultimate Pidgin Live Chat 😎",
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
      chatMode: chatModeDefault
    };

    const msg = text?.toLowerCase();
    const user = memory[userId];

    if (!text) return typingSend(m, "🙂 I dey here oh, wetin dey happen? Use `.buddy help` to see commands.");

    // Add XP
    user.xp += 10;
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      await typingSend(m, `🎉 Omo! You don level up! You don reach Level ${user.level} 😎`);
    }

    rememberMessage(user, msg);

    // ------------------- HELP -------------------
    if (msg === "help") {
      return typingSend(m, `📜 Buddy Pro Max Ultimate Commands:

👤 Personal Info:
1️⃣ .buddy name <name> - Set your name
2️⃣ .buddy favorite <thing> - Set your favorite thing
3️⃣ .buddy hobby <thing> - Add hobby
4️⃣ .buddy info - Show your info
5️⃣ .buddy mood <happy/sad/angry> / .buddy mood - Set or view mood

⏰ Reminders:
6️⃣ .buddy remind <10s/5m> <task> - Set reminder
7️⃣ .buddy reminders - View active reminders
8️⃣ .buddy delreminder <number> - Delete reminder

😂 Fun & Chat:
9️⃣ .buddy joke - Random Pidgin joke
🔟 .buddy advice - Random Pidgin quote / advice
1️⃣1️⃣ .buddy riddle - Get a random riddle
1️⃣2️⃣ .buddy story - Get a short story
1️⃣3️⃣ .buddy daily - Collect daily XP / bonus
1️⃣4️⃣ .buddy translate <text> - Translate text (fun mode)
1️⃣5️⃣ .buddy weather <city> - Fake weather info
1️⃣6️⃣ .buddy insult <name> - Random funny insult
1️⃣7️⃣ .buddy compliment <name> - Random compliment
1️⃣8️⃣ .buddy chatmode <on/off> - Turn live chat on/off

🎲 Mini-Games:
1️⃣9️⃣ .buddy rps <rock/paper/scissors> - Play Rock Paper Scissors
2️⃣0️⃣ .buddy coin - Flip a coin
2️⃣1️⃣ .buddy guess <1-20> - Guess the number game
2️⃣2️⃣ .buddy trivia - Start trivia
2️⃣3️⃣ .buddy answer <text> - Answer trivia / riddle
2️⃣4️⃣ .buddy roll - Roll dice
2️⃣5️⃣ .buddy math <expression> - Calculate math

🔎 Extras:
2️⃣6️⃣ .buddy moodcheck - Suggest activity based on mood
2️⃣7️⃣ .buddy facts - Random fun fact
2️⃣8️⃣ .buddy storytime - Interactive choose-your-adventure story

📊 Stats & Features:
2️⃣9️⃣ .buddy stats - View XP, level, mood, hobbies
3️⃣0️⃣ .buddy features - View Buddy Pro Max features list
`);
    }

    // ------------------- PERSONAL INFO -------------------
    if (msg.startsWith("name ")) {
      user.name = text.slice(5).trim();
      saveMemory();
      return typingSend(m, `✅ I go dey call you ${user.name} from now`);
    }

    if (msg.startsWith("favorite ")) {
      user.favorite = text.slice(9).trim();
      saveMemory();
      return typingSend(m, `🎉 I don remember say your favorite na ${user.favorite}`);
    }

    if (msg.startsWith("hobby ")) {
      const hobby = text.slice(6).trim();
      user.hobbies.push(hobby);
      saveMemory();
      return typingSend(m, `✅ I don add hobby: ${hobby}`);
    }

    if (msg === "info") {
      return typingSend(m, `📋 Your info:
Name: ${user.name || "N/A"}
Favorite: ${user.favorite || "N/A"}
Hobbies: ${user.hobbies.join(", ") || "N/A"}
Mood: ${user.mood || "neutral"}
Level: ${user.level}
XP: ${user.xp}`);
    }

    // ------------------- MOOD -------------------
    if (msg.startsWith("mood ")) {
      user.mood = text.slice(5).trim();
      saveMemory();
      return typingSend(m, `🙂 I don set your mood to "${user.mood}"`);
    }

    if (msg === "mood") return typingSend(m, `🙂 Your last mood na "${user.mood}"`);

    // ------------------- REMINDERS -------------------
    if (msg.startsWith("remind ")) {
      const parts = text.slice(7).trim().split(" ");
      const delayTime = parseTime(parts[0]);
      const task = parts.slice(1).join(" ");
      if (!delayTime || !task)
        return typingSend(m, "❌ Wrong usage! Example: `.buddy remind 10s Drink water`");
      const reminder = { task, time: Date.now() + delayTime };
      user.reminders.push(reminder);
      saveMemory();
      setTimeout(async () => {
        try {
          await typingSend(m, `🔔 Reminder: "${task}"`);
          user.reminders = user.reminders.filter(r => r !== reminder);
          saveMemory();
        } catch (e) {}
      }, delayTime);
      return typingSend(m, `⏳ Reminder don set: "${task}" for ${parts[0]}`);
    }

    if (msg === "reminders") {
      if (!user.reminders.length) return typingSend(m, "📭 You no get active reminder");
      let list = "⏳ Your reminders:\n";
      user.reminders.forEach((r, i) => {
        const remaining = Math.max(0, Math.round((r.time - Date.now()) / 1000));
        list += `${i + 1}. ${r.task} - ${remaining}s left\n`;
      });
      return typingSend(m, list);
    }

    if (msg.startsWith("delreminder ")) {
      const num = parseInt(msg.split(" ")[1]);
      if (isNaN(num) || num < 1 || num > user.reminders.length)
        return typingSend(m, "❌ Wrong usage! Example: `.buddy delreminder 1`");
      const removed = user.reminders.splice(num - 1, 1);
      saveMemory();
      return typingSend(m, `✅ I don remove reminder: ${removed[0].task}`);
    }

    // ------------------- JOKES & QUOTES -------------------
    if (msg.includes("joke")) return typingSend(m, randomItem(jokes));
    if (msg.includes("advice")) return typingSend(m, randomItem(quotes));

    // ------------------- MINI-GAMES -------------------
    if (msg.startsWith("rps ")) {
      const choice = msg.split(" ")[1];
      const valid = ["rock", "paper", "scissors"];
      if (!valid.includes(choice))
        return typingSend(m, "❌ Invalid choice! Example: `.buddy rps rock`");
      const botChoice = randomItem(valid);
      let result = "";
      if (choice === botChoice) result = "🤝 Na tie!";
      else if (
        (choice === "rock" && botChoice === "scissors") ||
        (choice === "paper" && botChoice === "rock") ||
        (choice === "scissors" && botChoice === "paper")
      ) result = "🎉 You knack am oh!";
      else result = "😢 You lose oh!";
      return typingSend(m, `You: ${choice}\nMe: ${botChoice}\n${result}`);
    }

    if (msg === "coin") return typingSend(m, `🪙 Coin flip: ${Math.random() < 0.5 ? "Heads ooo" : "Tails 😎"}`);

    if (msg.startsWith("guess ")) {
      const guess = parseInt(msg.split(" ")[1]);
      if (isNaN(guess) || guess < 1 || guess > 20)
        return typingSend(m, "❌ Number must be between 1-20. Example: `.buddy guess 12`");
      const number = Math.floor(Math.random() * 20) + 1;
      if (guess === number) {
        user.xp += 15;
        saveMemory();
        return typingSend(m, `🎉 Chai! Correct! Na ${number} be am. You earn 15 XP`);
      } else if (guess < number) return typingSend(m, "📈 Too small oh, try again");
      else return typingSend(m, "📉 Too high oh, try again");
    }

    if (msg === "trivia") {
      const q = randomItem(trivia);
      user.game.triviaAnswer = q.a;
      saveMemory();
      return typingSend(m, `❓ Trivia: ${q.q} (reply with .buddy answer <your answer>)`);
    }

    if (msg.startsWith("answer ")) {
      const answer = text.slice(7).trim().toLowerCase();
      if (!user.game.triviaAnswer && !user.game.riddleAnswer)
        return typingSend(m, "❌ No active trivia or riddle question");
      if (answer === (user.game.triviaAnswer || user.game.riddleAnswer)) {
        user.xp += 20;
        user.game.triviaAnswer = null;
        user.game.riddleAnswer = null;
        saveMemory();
        return typingSend(m, "🎉 Correct! You earn 20 XP 😎");
      } else {
        user.game.triviaAnswer = null;
        user.game.riddleAnswer = null;
        saveMemory();
        return typingSend(m, "❌ Wrong oh! Better luck next time");
      }
    }

    // ------------------- STATS & FEATURES -------------------
    if (msg === "stats") {
      return typingSend(m, `📊 Stats:
XP: ${user.xp}
Level: ${user.level}
Mood: ${user.mood || "neutral"}
Hobbies: ${user.hobbies.join(", ") || "N/A"}
Favorite: ${user.favorite || "N/A"}`);
    }

    if (msg === "features") {
      const featureList = `
📜 Buddy Pro Max Ultimate Features & Commands
- Personalized Chat
- Mood System
- XP & Level System
- Reminders
- Mini-Games
- Mega Jokes & Quotes
- Translate / Weather / Riddle / Story / Daily / Math / Roll / Facts
- Live Chat Mode 😎
`;
      return typingSend(m, featureList);
    }

    // ------------------- NEW COMMANDS -------------------
    if (msg.startsWith("translate ")) {
      const txt = text.slice(10).trim();
      if (!txt) return typingSend(m, "❌ Usage: `.buddy translate Hello, how are you?`");
      return typingSend(m, `🌐 Translation: ${txt.split(" ").map(w => w+"o").join(" ")}`);
    }

    if (msg.startsWith("weather ")) {
      const city = text.slice(8).trim();
      if (!city) return typingSend(m, "❌ Usage: `.buddy weather Lagos`");
      return typingSend(m, fakeWeather(city));
    }

    if (msg.startsWith("insult ")) {
      const name = text.slice(7).trim();
      if (!name) return typingSend(m, "❌ Usage: `.buddy insult Peter`");
      const insults = [
        `${name}, your head dey empty like internet wey never load`,
        `${name}, your fashion dey confuse like spaghetti`,
        `${name}, your brain dey sleep pass your body 😆`
      ];
      return typingSend(m, randomItem(insults));
    }

    if (msg.startsWith("compliment ")) {
      const name = text.slice(11).trim();
      if (!name) return typingSend(m, "❌ Usage: `.buddy compliment Sarah`");
      const compliments = [
        `${name}, you fine pass everybody wey I don see today!`,
        `${name}, you sabi well well 😎`,
        `${name}, your smile dey shine like sun 🌞`
      ];
      return typingSend(m, randomItem(compliments));
    }

    if (msg === "riddle") {
      const r = randomItem(riddles);
      user.game.riddleAnswer = r.a;
      saveMemory();
      return typingSend(m, `❓ Riddle: ${r.q} (reply with .buddy answer <your answer>)`);
    }

    if (msg === "story") return typingSend(m, randomItem(stories));

    if (msg === "daily") {
      user.xp += 50;
      saveMemory();
      return typingSend(m, "🎁 You don collect daily 50 XP! 😎");
    }

    if (msg.startsWith("chatmode ")) {
      const mode = text.slice(9).trim();
      if (!["on","off"].includes(mode)) return typingSend(m, "❌ Usage: `.buddy chatmode on/off`");
      user.chatMode = mode === "on";
      saveMemory();
      return typingSend(m, `✅ Chat mode set to ${mode}`);
    }

    if (msg === "roll") return typingSend(m, `🎲 You roll: ${rollDice()}`);

    if (msg.startsWith("math ")) {
      const expr = text.slice(5).trim();
      if (!expr) return typingSend(m, "❌ Usage: `.buddy math 2+2`");
      const res = safeEval(expr);
      if (res === null) return typingSend(m, "❌ Invalid math expression");
      return typingSend(m, `🧮 Result: ${res}`);
    }

    if (msg === "moodcheck") {
      const suggestions = {