const { kord } = require(process.cwd() + "/core");
const axios = require("axios");
const OpenAI = require("openai");

// ===== OPENAI v4 CLIENT =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ===== HELP FUNCTION =====
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== ROAST DATA =====
const roasts = [
  "💀 Even silence dey make more sense than you.",
  "🔥 Your whole existence be typo.",
  "😂 Brain loading… error 404.",
  "😈 You dey reason backwards with confidence.",
  "💀 Even Google no fit find your sense.",
  "🔥 Your future dey buffering permanently.",
  "😂 Confidence full, result empty.",
  "😈 You be walking misunderstanding.",
  "💀 Your logic dey on sick leave.",
  "🔥 You dey talk like Wi-Fi with one bar.",
  "😂 Even your village people don mute you.",
  "😈 Your thinking dey optional.",
  "💀 Hope see you and rest.",
  "🔥 You dey try, but wrong direction.",
  "😂 Even mistake look you say ‘damn’.",
  "😈 Your IQ dey hide from shame.",
  "💀 Sense dey missing, reward active.",
  "🔥 Your mouth faster than your brain.",
  "😂 Destiny use incognito for you.",
  "😈 You be example of how not to."
];

/* ===== WEATHER FUNCTION ===== */
async function getWeather(city) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return "❌ Weather API key not set";

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const res = await axios.get(url);
    const w = res.data;

    return `🌤 Weather in ${w.name}
Condition: ${w.weather[0].description}
🌡 Temp: ${w.main.temp}°C
🤒 Feels like: ${w.main.feels_like}°C
💧 Humidity: ${w.main.humidity}%
🌬 Wind: ${w.wind.speed} m/s`;
  } catch {
    return "❌ City not found or weather service error";
  }
}

/* ===== MUSIC FUNCTION ===== */
async function searchMusic(query) {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url);
    const data = res.data.data;
    if (!data || data.length === 0) return { text: "❌ No music found.", preview: null };

    const song = data[0];
    return {
      text: `🎵 Now Playing Preview
🎶 ${song.title}
👤 ${song.artist.name}
💿 ${song.album.title}
⏱ 30s preview`,
      preview: song.preview
    };
  } catch {
    return { text: "❌ Music error.", preview: null };
  }
}

/* ===== GOST COMMAND ===== */
kord(
  {
    cmd: "gost",
    desc: "Gost – smart AI, brutal roasts, music, weather 👻",
    fromMe: false,
    type: "fun"
  },
  async (m, text) => {
    const msg = (text || "").trim();
    const lowerMsg = msg.toLowerCase();

    /* ===== GOST MENU ===== */
    if (lowerMsg === "menu") {
      return m.send(
`👻 *GOST MAIN MENU*

🤖 AI CHAT
- .gost chat <message> → Talk to Gost (English + Pidgin)

🔥 ROASTS
- .gost roast → Roast yourself
- .gost roast @user → Roast someone by mention
- .gost lastroast → Roast the last message replied to

🎵 MUSIC
- .gost music <song/artist> → Search music & preview 30s audio

🌤 WEATHER
- .gost weather <city> → Get live weather report

📜 HELP
- .gost help → Quick help
- .gost menu → Full menu with all commands`
      );
    }

    /* ===== HELP ===== */
    if (!msg || lowerMsg === "help") {
      return m.send(
`👻 *GOST COMMANDS*

🤖 AI CHAT
.gost chat <message> → Talk to Gost (English + Pidgin)

🔥 ROASTS
.gost roast → Roast yourself
.gost roast @user → Roast someone by mention
.gost lastroast → Roast the last message replied to

🎵 MUSIC
.gost music <song/artist> → Search music & preview 30s audio

🌤 WEATHER
.gost weather <city> → Get live weather

📜 HELP
.gost help → Show quick help
.gost menu → Full menu with all commands`
      );
    }

    /* ===== AI CHAT ===== */
    if (lowerMsg.startsWith("chat ")) {
      const prompt = msg.slice(5);
      if (!process.env.OPENAI_API_KEY) return m.send("❌ OPENAI_API_KEY not set");

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are Gost, a witty Nigerian street-smart friend. Reply in English + Pidgin. Be friendly, human-like, sometimes sarcastic." },
            { role: "user", content: prompt }
          ]
        });

        return m.send(completion.choices[0].message.content);
      } catch (e) {
        return m.send("❌ AI error: " + e.message);
      }
    }

    /* ===== WEATHER ===== */
    if (lowerMsg.startsWith("weather ")) {
      const city = msg.slice(8).trim();
      if (!city) return m.send("❌ Usage: .gost weather <city>");
      const report = await getWeather(city);
      return m.send(report);
    }

    /* ===== MUSIC ===== */
    if (lowerMsg.startsWith("music ")) {
      const query = msg.slice(6).trim();
      if (!query) return m.send("❌ Usage: .gost music <song or artist>");
      const result = await searchMusic(query);
      await m.send(result.text);
      if (result.preview) return m.send({ audio: { url: result.preview }, mimetype: "audio/mp4" });
      return;
    }

    /* ===== SELF ROAST ===== */
    if (lowerMsg === "roast") return m.send("🔥 " + pick(roasts));

    /* ===== MENTION ROAST ===== */
    if (lowerMsg.startsWith("roast")) {
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        const user = m.mentionedJid[0];
        return m.send(
          `🔥 @${user.split("@")[0]}, ${pick(roasts)}`,
          { mentions: [user] }
        );
      }
    }

    /* ===== LAST MESSAGE ROAST ===== */
    if (lowerMsg === "lastroast") {
      if (!m.quoted) return m.send("❌ Reply to a message first");
      const user = m.quoted.sender;
      const quotedText = m.quoted.text || "this message";
      return m.send(
        `💀 @${user.split("@")[0]}, you said:\n"${quotedText}"\n\n🔥 ${pick(roasts)}`,
        { mentions: [user] }
      );
    }

    return m.send("❓ Unknown command\nType *.gost help*");
  }
);

module.exports = {};