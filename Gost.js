const { kord } = require(process.cwd() + "/core");
const axios = require("axios");
const OpenAI = require("openai");

// ===== OPENAI CLIENT =====
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===== USER LANGUAGE STORAGE =====
const userLang = {};
const langs = ["english","pigin","yoruba","igbo","french","spanish","hausa"];

// ===== HELPER =====
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// ===== DATA =====
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

const jokes = Array.from({length:100},(_,i)=>`Joke ${i+1}`);
const stories = Array.from({length:100},(_,i)=>`Story ${i+1}`);
const quotes = Array.from({length:100},(_,i)=>`Quote ${i+1}`);
const facts = Array.from({length:100},(_,i)=>`Fact ${i+1}`);

// ===== WEATHER FUNCTION =====
async function getWeather(city){
  try{
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if(!apiKey) return "❌ Weather API key not set";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const res = await axios.get(url);
    const w = res.data;
    return `🌤 Weather in ${w.name}
Condition: ${w.weather[0].description}
🌡 Temp: ${w.main.temp}°C
🤒 Feels like: ${w.main.feels_like}°C
💧 Humidity: ${w.main.humidity}%
🌬 Wind: ${w.wind.speed} m/s`;
  }catch{
    return "❌ City not found or weather service error";
  }
}

// ===== MUSIC FUNCTION =====
async function searchMusic(query){
  try{
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url);
    const data = res.data.data;
    if(!data || data.length===0) return {text:"❌ No music found", preview:null};
    const song = data[0];
    return {
      text:`🎵 Now Playing Preview
🎶 ${song.title}
👤 ${song.artist.name}
💿 ${song.album.title}
⏱ 30s preview`,
      preview:song.preview
    };
  }catch{
    return {text:"❌ Music error", preview:null};
  }
}

// ===== MINI GAME =====
kord({
  cmd: "guess",
  desc: "Guess the number game (1-20)",
  fromMe: false,
  type: "game"
}, async (m, text)=>{
  if(!text) return m.send("❌ Usage: .guess <number>");
  const guess = parseInt(text);
  if(isNaN(guess)||guess<1||guess>20) return m.send("❌ Number must be between 1 and 20");
  const number = Math.floor(Math.random()*20)+1;
  if(guess===number) return m.send(`🎉 Correct! The number was ${number}`);
  else if(guess<number) return m.send("📈 Too low! Try again");
  else return m.send("📉 Too high! Try again");
});

// ===== MAIN GOST COMMAND =====
kord({
  cmd: "gost",
  desc: "Gost mega bot",
  fromMe: false,
  type: "fun"
}, async (m, text)=>{
  const msg = (text||"").trim();
  const lowerMsg = msg.toLowerCase();
  const lang = userLang[m.sender] || "english";

  // 🔹 Ping Gost fun if just .gost
  if(msg === ""){
    return m.send("Sup my nigger 😎 any problem? 💀");
  }

  // 🔹 LANGUAGE SWITCH
  if(lowerMsg.startsWith("lang ")){
    const l = lowerMsg.slice(5).trim();
    if(!langs.includes(l)) return m.send(`❌ Language not supported. Options: ${langs.join(", ")}`);
    userLang[m.sender] = l;
    return m.send(`✅ Language changed to ${l}`);
  }

  // 🔹 GIST SUMMARIZER (text or replied message)
  if(lowerMsg.startsWith("gist")){
    let content = msg.slice(4).trim();
    if(!content){
      if(m.quoted && m.quoted.text) content = m.quoted.text;
      else return m.send("❌ Usage: .gost gist <text or reply to a message>");
    }
    try{
      const prompt = `Summarize the following clearly and concisely. Detect if it's text or code:\n\n${content}`;
      const completion = await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[
          {role:"system", content:"You are Gost, a friendly AI bot that summarizes text and code clearly."},
          {role:"user", content:prompt}
        ]
      });
      const summary = completion.choices[0].message.content;
      return m.send(`📝 Summary:\n${summary}`);
    }catch(e){
      return m.send("❌ AI error: "+e.message);
    }
  }

  // 🔹 AI CHAT
  if(lowerMsg.startsWith("chat ")){
    const prompt = msg.slice(5).trim();
    if(!prompt) return m.send("❌ Usage: .gost chat <message>");
    if(!process.env.OPENAI_API_KEY) return m.send("❌ OPENAI_API_KEY not set");
    try{
      const completion = await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[
          {role:"system",content:`You are Gost, a witty Nigerian friend. Reply in ${lang}. Be friendly, funny, human-like.`},
          {role:"user", content:prompt}
        ]
      });
      return m.send(completion.choices[0].message.content);
    }catch(e){
      return m.send("❌ AI error: "+e.message);
    }
  }

  // 🔹 JOKES, STORIES, QUOTES, FACTS
  if(lowerMsg==="joke") return m.send(pick(jokes));
  if(lowerMsg==="story") return m.send(pick(stories));
  if(lowerMsg==="quote") return m.send(pick(quotes));
  if(lowerMsg==="fact") return m.send(pick(facts));

  // 🔹 WEATHER
  if(lowerMsg.startsWith("weather ")){
    const city = msg.slice(8).trim();
    if(!city) return m.send("❌ Usage: .gost weather <city>");
    const w = await getWeather(city);
    return m.send(w);
  }

  // 🔹 MUSIC
  if(lowerMsg.startsWith("music ")){
    const query = msg.slice(6).trim();
    if(!query) return m.send("❌ Usage: .gost music <song/artist>");
    const {text:mus, preview} = await searchMusic(query);
    return m.send(mus); // for simplicity, preview URL could also be sent
  }

  // 🔹 ROAST
  if(lowerMsg==="roast") return m.send(pick(roasts));
  if(lowerMsg.startsWith("roast ")){
    // mention user roast
    return m.send(pick(roasts));
  }

  // 🔹 LASTROAST (optional)
  if(lowerMsg==="lastroast") return m.send(pick(roasts));

  // 🔹 HELP/MENU
  if(lowerMsg==="help" || lowerMsg==="menu"){
    return m.send(`
🤖 Gost Commands:
.gost - ping
.gost chat <msg> - AI chat
.gost gist <text> - summarize text or reply
.gost lang <language> - switch language
.joke, .story, .quote, .fact
.guess <number>
.gost weather <city>
.gost music <song/artist>
.roast, .roast @user, .lastroast
.help / .menu - this menu
Languages: ${langs.join(", ")}
    `);
  }

});