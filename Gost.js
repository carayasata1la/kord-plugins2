const { kord } = require(process.cwd() + "/core");
const axios = require("axios");
const OpenAI = require("openai");

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Random pick function
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

// Sample jokes, stories, quotes, facts (expand as needed)
const jokes = [
  "Why did the chicken cross the road? To get to the other side!",
  "I told my computer I needed a break, and it said 'No problem — I'll go to sleep!'",
  "Why don’t scientists trust atoms? Because they make up everything!"
];
const stories = [
  "Once upon a time in a village, a boy dreamed of flying...",
  "A farmer planted a magic seed; it grew a huge tree overnight!"
];
const quotes = [
  "Life is what happens when you're busy making other plans. – John Lennon",
  "Be yourself; everyone else is already taken. – Oscar Wilde"
];
const facts = [
  "Honey never spoils. Archaeologists found 3000-year-old honey still edible!",
  "Octopuses have three hearts and blue blood."
];
const roasts = [
  "You're as useless as the 'ueue' in 'queue'.",
  "You're like a cloud. When you disappear, it's a beautiful day."
];

// Language for chat
const userLang = {}; // { userID: "english" }

kord({
  cmd: "gost",
  desc: "Gost mega bot commands",
  fromMe: false,
  type: "fun"
}, async (m, text)=>{
  const msg = (text||"").trim();
  const lowerMsg = msg.toLowerCase();

  // Sup reply
  if(msg === "") return m.send("Sup my nigger 😎 any problem? 💀");

  // ===== GIST SUMMARIZER =====
  if(lowerMsg.startsWith("gist")){
    let content = msg.slice(4).trim();
    if(!content){
      if(m.quoted && m.quoted.text) content = m.quoted.text;
      else return m.send("❌ Usage: .gost gist <text or reply to a message>");
    }
    try{
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages:[
          {role:"system", content:"You are Gost, a friendly AI bot that summarizes text and code clearly."},
          {role:"user", content:`Summarize this text or code clearly and concisely:\n\n${content}`}
        ]
      });
      const summary = completion.choices[0].message.content;
      return m.send(`📝 Summary:\n${summary}`);
    }catch(e){ return m.send("❌ AI error: "+e.message);}
  }

  // ===== AI CHAT =====
  if(lowerMsg.startsWith("chat ")){
    const chatText = msg.slice(5).trim();
    if(!chatText) return m.send("❌ Usage: .gost chat <message>");
    const lang = userLang[m.sender] || "english";
    try{
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages:[
          {role:"system", content:`You are Gost, a helpful AI bot speaking ${lang}.`},
          {role:"user", content: chatText}
        ]
      });
      return m.send(completion.choices[0].message.content);
    }catch(e){ return m.send("❌ AI chat error: "+e.message);}
  }

  // ===== ROASTS =====
  if(lowerMsg === "roast") return m.send(pick(roasts));
  if(lowerMsg.startsWith("roast ")){
    return m.send(pick(roasts));
  }
  if(lowerMsg === "lastroast") return m.send(pick(roasts));

  // ===== JOKE / STORY / QUOTE / FACT =====
  if(lowerMsg === "joke") return m.send(pick(jokes));
  if(lowerMsg === "story") return m.send(pick(stories));
  if(lowerMsg === "quote") return m.send(pick(quotes));
  if(lowerMsg === "fact") return m.send(pick(facts));

  // ===== MUSIC SEARCH (Preview URL) =====
  if(lowerMsg.startsWith("music ")){
    const query = msg.slice(6).trim();
    if(!query) return m.send("❌ Usage: .gost music <song/artist>");
    // Example: return preview URL (implement your own API for real)
    return m.send(`🎵 Music preview for "${query}": https://www.example.com/${encodeURIComponent(query)}`);
  }

  // ===== WEATHER =====
  if(lowerMsg.startsWith("weather ")){
    const city = msg.slice(8).trim();
    if(!city) return m.send("❌ Usage: .gost weather <city>");
    try{
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if(!apiKey) return m.send("❌ Weather API key not set");
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
      const w = res.data;
      return m.send(`🌤 Weather in ${w.name}\nCondition: ${w.weather[0].description}\n🌡 Temp: ${w.main.temp}°C\nFeels like: ${w.main.feels_like}°C\n💧 Humidity: ${w.main.humidity}%\n🌬 Wind: ${w.wind.speed} m/s`);
    }catch(e){ return m.send("❌ City not found or weather service error");}
  }

  // ===== LANGUAGE SWITCH =====
  if(lowerMsg.startsWith("lang ")){
    const lang = msg.slice(5).trim().toLowerCase();
    const available = ["english","pigin","yoruba","igbo","french","spanish","hausa"];
    if(!available.includes(lang)) return m.send("❌ Language not supported");
    userLang[m.sender] = lang;
    return m.send(`✅ Language changed to ${lang}`);
  }

  // ===== AI IMAGE CREATOR =====
  if(lowerMsg.startsWith("pic ")){
    const prompt = msg.slice(4).trim();
    if(!prompt) return m.send("❌ Usage: .gost pic <description>");
    try{
      const result = await openai.images.generate({
        model:"gpt-image-1",
        prompt: prompt,
        size:"1024x1024"
      });
      const imageUrl = result.data[0].url;
      return m.send(`🖼 Here's your image:\n${imageUrl}`);
    }catch(e){ return m.send("❌ Image generation error: "+e.message);}
  }

  // ===== HELP / MENU =====
  if(lowerMsg === "help" || lowerMsg === "menu"){
    return m.send(
`👻 *GOST MAIN MENU*

🤖 AI CHAT
- .gost chat <message> → Talk to Gost in your chosen language

📝 GIST SUMMARIZER
- .gost gist <text> → Summarize text
- .gost gist → Reply to a message to summarize it automatically

🔥 ROASTS
- .gost roast → Roast yourself
- .gost roast @user → Roast someone
- .gost lastroast → Roast last replied message

😂 FUN
- .joke → Random joke
- .story → Random story
- .quote → Random quote
- .fact → Random fact

🎵 MUSIC
- .gost music <song/artist> → Search music & 30s preview

🌤 WEATHER
- .gost weather <city> → Real-time weather

🖼 AI IMAGE
- .gost pic <description> → Generate image from text

🌐 LANGUAGE
- .gost lang <language> → Change language (english, pigin, yoruba, igbo, french, spanish, hausa)`
    );
  }
});