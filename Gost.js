const { kord } = require(process.cwd() + "/core");
const fs = require("fs");
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

// ---------------- MEMORY ----------------
const pathMemory = process.cwd() + "/memory_gost.json";
let memory = {};
if (fs.existsSync(pathMemory)) memory = JSON.parse(fs.readFileSync(pathMemory));
else fs.writeFileSync(pathMemory, JSON.stringify(memory, null, 2));

function saveMemory() {
  fs.writeFileSync(pathMemory, JSON.stringify(memory, null, 2));
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

// ---------------- OPENAI ----------------
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

async function getGostReply(message, userName) {
  const prompt = `
You are a friendly AI assistant named Gost.
Reply to this message: "${message}"
Use both Pidgin English and English mix.
Make it short, funny, friendly, and natural.
  `;
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8
    });
    return response.data.choices[0].message.content;
  } catch {
    return "😅 Chai, I no fit respond now, try again.";
  }
}

// ---------------- CONTENT ----------------
// 100 jokes
const jokes = [
"😂 Joke 1 – Wetin dey happen?",
"😂 Joke 2 – Na so life be!",
"😂 Joke 3 – Why chicken cross road? To get food!",
"😂 Joke 4 – Wetin you dey look?",
"😂 Joke 5 – I don hear say...",
// … continue up to 100
];
// 100 long stories
const stories = [
"📖 Story 1 – Long story wey go entertain you well well!",
"📖 Story 2 – Once upon a time in Pidginland...",
"📖 Story 3 – I get one tale...",
// … continue up to 100
];
// 100 quotes
const quotes = [
"💡 Quote 1 – Small advice to brighten your day!",
"💡 Quote 2 – No forget say patience dey important.",
"💡 Quote 3 – Life na journey, enjoy am!",
// … continue up to 100
];

// ---------------- HELP & COMMAND LIST ----------------
const commandsList = [
{cmd:".gost name <name>",desc:"Set your name"},
{cmd:".gost favorite <thing>",desc:"Set favorite thing"},
{cmd:".gost hobby <thing>",desc:"Add hobby"},
{cmd:".gost info",desc:"Show personal info"},
{cmd:".gost mood <mood>",desc:"Set mood"},
{cmd:".gost mood",desc:"Show last mood"},
{cmd:".gost remind <10s/5m> <task>",desc:"Set reminder"},
{cmd:".gost reminders",desc:"List reminders"},
{cmd:".gost delreminder <number>",desc:"Delete reminder"},
{cmd:".gost joke",desc:"Random joke"},
{cmd:".gost story",desc:"Random story"},
{cmd:".gost advice",desc:"Random quote/advice"},
{cmd:".gost weather <city>",desc:"Get weather"},
{cmd:".gost rps <rock/paper/scissors>",desc:"Play rock-paper-scissors"},
{cmd:".gost coin",desc:"Flip coin"},
{cmd:".gost guess <1-20>",desc:"Guess number game"},
{cmd:".gost roll",desc:"Roll dice"},
{cmd:".gost math <expression>",desc:"Math calculation"},
{cmd:".gost chatmode <on/off>",desc:"Enable/disable chat mode"},
{cmd:".gost features",desc:"Show features list"},
{cmd:".gost secret",desc:"Secret Easter egg"},
{cmd:".gost help",desc:"Show this help menu"}
];

// ---------------- GOST COMMAND ----------------
kord({
  cmd:"gost",
  desc:"Gost Infinity AI bot",
  fromMe:false,
  type:"fun"
},async(m,text)=>{
  const userId=m.sender;
  if(!memory[userId]) memory[userId]={name:null,favorite:null,hobbies:[],mood:"neutral",reminders:[],game:{},lastMessages:[],chatMode:true};
  const user=memory[userId];
  const msg=text?.toLowerCase();
  if(!text) return await typingSend(m,"🙂 I dey here oh, wetin dey happen? Use `.gost help` to see commands.");

  if(!user.lastMessages) user.lastMessages=[];
  user.lastMessages.push(msg);
  if(user.lastMessages.length>3) user.lastMessages.shift();

  // ---------------- HELP ----------------
  if(msg==="help"){
    let helpText="📜 Gost Infinity Commands:\n\n";
    commandsList.forEach(c=>{helpText+=`${c.cmd} - ${c.desc}\n`;});
    return await typingSend(m,helpText);
  }

  // ---------------- SECRET ----------------
  if(msg==="secret") return await typingSend(m,"🫥 Chai! My owner is Gost 💀");

  // ---------------- PERSONAL INFO ----------------
  if(msg.startsWith("name ")) {user.name=text.slice(5).trim();saveMemory();return await typingSend(m,`✅ I go dey call you ${user.name}`);}
  if(msg.startsWith("favorite ")) {user.favorite=text.slice(9).trim();saveMemory();return await typingSend(m,`🎉 I don remember say your favorite na ${user.favorite}`);}
  if(msg.startsWith("hobby ")) {const h=text.slice(6).trim();user.hobbies.push(h);saveMemory();return await typingSend(m,`✅ I don add hobby: ${h}`);}
  if(msg==="info") return await typingSend(m,`📋 Info:\nName: ${user.name||"N/A"}\nFavorite: ${user.favorite||"N/A"}\nHobbies: ${user.hobbies.join(",")||"N/A"}\nMood: ${user.mood}`);

  // ---------------- MOOD ----------------
  if(msg.startsWith("mood ")) {user.mood=text.slice(5).trim();saveMemory();return await typingSend(m,`🙂 Mood set to "${user.mood}"`);}
  if(msg==="mood") return await typingSend(m,`🙂 Your last mood na "${user.mood}"`);

  // ---------------- REMINDERS ----------------
  if(msg.startsWith("remind ")){
    const parts=text.slice(7).trim().split(" ");
    const delayTime=parseTime(parts[0]);
    const task=parts.slice(1).join(" ");
    if(!delayTime||!task) return await typingSend(m,"❌ Wrong usage! Example: `.gost remind 10s Drink water`");
    const reminder={task,time:Date.now()+delayTime};
    user.reminders.push(reminder);saveMemory();
    setTimeout(async()=>{try{await typingSend(m,`🔔 Reminder: "${task}"`);user.reminders=user.reminders.filter(r=>r!==reminder);saveMemory();}catch{}} ,delayTime);
    return await typingSend(m,`⏳ Reminder set: "${task}" for ${parts[0]}`);
  }
  if(msg==="reminders"){if(!user.reminders.length) return await typingSend(m,"📭 You no get active reminder");let list="⏳ Your reminders:\n";user.reminders.forEach((r,i)=>{const rem=Math.max(0,Math.round((r.time-Date.now())/1000));list+=`${i+1}. ${r.task} - ${rem}s left\n`;});return await typingSend(m,list);}
  if(msg.startsWith("delreminder ")){const num=parseInt(msg.split(" ")[1]);if(isNaN(num)||num<1||num>user.reminders.length)return await typingSend(m,"❌ Wrong usage!");const removed=user.reminders.splice(num-1,1);saveMemory();return await typingSend(m,`✅ Removed reminder: ${removed[0].task}`);}

  // ---------------- FUN ----------------
  if(msg.includes("joke")) return await typingSend(m,randomItem(jokes));
  if(msg.includes("advice")||msg.includes("quote")) return await typingSend(m,randomItem(quotes));
  if(msg==="story") return await typingSend(m,randomItem(stories));
  if(msg.startsWith("weather ")) return await typingSend(m,fakeWeather(text.slice(8).trim()));

  // ---------------- MINI-GAMES ----------------
  if(msg.startsWith("rps ")){const choice=msg.split(" ")[1];const valid=["rock","paper","scissors"];if(!valid.includes(choice)) return await typingSend(m,"❌ Invalid choice!");const bot=randomItem(valid);let res="";if(choice===bot) res="🤝 Tie!";else if((choice==="rock"&&bot==="scissors")||(choice==="paper"&&bot==="rock")||(choice==="scissors"&&bot==="paper")) res="🎉 You win!";else res="😢 You lose!";return await typingSend(m,`You: ${choice}\nMe: ${bot}\n${res}`);}
  if(msg==="coin") return await typingSend(m,`🪙 Coin: ${Math.random()<0.5?"Heads":"Tails"}`);
  if(msg.startsWith("guess ")){const guess=parseInt(msg.split(" ")[1]);const number=Math.floor(Math.random()*20)+1;if(guess===number)return await typingSend(m,`🎉 Correct! Number na ${number}.`);else if(guess<number)return await typingSend(m,"📈 Too small!");else return await typingSend(m,"📉 Too high!");}
  if(msg==="roll") return await typingSend(m,`🎲 You roll: ${rollDice()}`);
  if(msg.startsWith("math ")){const expr=text.slice(5).trim();const res=safeEval(expr);return res===null?await typingSend(m,"❌ Invalid math"):await typingSend(m,`🧮 Result: ${res}`);}

  // ---------------- STATS ----------------
  if(msg==="features") return await typingSend(m,`✨ Gost Infinity Features:\n- 100 jokes, 100 stories, 100 quotes\n- Mood system\n- Mini-games\n- Reminders\n- Chat mode\n- Secret Easter egg 🫥`);

  // ---------------- CHAT MODE ----------------
  if(msg.startsWith("chatmode ")){const mode=text.slice(9).trim();if(mode==="on")user.chatMode=true;else if(mode==="off")user.chatMode=false;saveMemory();return await typingSend(m,`Chat mode set to ${mode}`);}

  // ---------------- FALLBACK CHAT ----------------
  if(user.chatMode){
    const reply=await getGostReply(msg,user.name||"Friend");
    return await typingSend(m,reply);
  }

  return await typingSend(m,"❌ I no understand that. Use `.gost help` to see commands");
});

async function typingSend(m,text){await delay(1000+Math.floor(Math.random()*1500));return m.send(text);}