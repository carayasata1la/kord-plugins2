// ----------------- MAIN COMMAND -----------------
kord(
  { cmd: "gost|gst", desc: "Gost AI (premium assistant + session auto-reply)", fromMe: wtype, type: "tools", react: "👻" },
  async (m, text) => {
    try {
      const raw = getTextFromAny(m, text).trim();
      const args = raw.split(/\s+/).filter(Boolean);
      const sub = (args[0] || "menu").toLowerCase();
      const rest = args.slice(1).join(" ").trim();
      const p = SAFE_PREFIX();

      // --- SIMPLE TRIGGER ---
      if (sub === "" || sub === "gost") {
        return sendText(m, "👻 Wetin dey, my guy? I dey here!");
      }

      // --- SESSION CONTROLS ---
      if (sub === "on") { if (!isAllowed(m)) return; setSession(m, true); return sendText(m, `Session ON. Mode: ${sessionState(m).mode.toUpperCase()}`); }
      if (sub === "off") { if (!isAllowed(m)) return; setSession(m, false); return sendText(m, "Session OFF."); }
      if (sub === "mode") { if (!isAllowed(m)) return; const md = setMode(m, rest); if (!md) return sendText(m, `Use: ${p}gost mode tag  OR  ${p}gost mode all`); return sendText(m, `Mode set: ${md.toUpperCase()}`); }
      if (sub === "status") { const st = sessionState(m); return sendText(m, `Session: ${st.on ? "ON" : "OFF"}\nMode: ${st.mode.toUpperCase()}`); }

      // --- MENU / HELP ---
      if (sub === "menu" || sub === "help") return sendMenu(m);
      if (sub === "setup") {
        const okAI = OPENAI_API_KEY ? "✅" : "❌";
        const okW = (process.env.OPENWEATHER_API_KEY || "").trim() ? "✅" : "❌";
        return sendText(m,
          `SETUP\nAI Key: ${okAI}\nWeather Key: ${okW}\nModel: ${MODEL}\nMemory: ${memCap()} turns\nCooldown: ${cdSec()}s\nTheme: ${(process.env.GOST_THEME || "neon")}`
        );
      }

      // --- MEMORY ---
      if (sub === "mem") { const hist = loadMem(m); return sendText(m, `Memory saved: ${hist.length}/${memCap()}`); }
      if (sub === "memclear") { clearMem(m); return sendText(m, "Memory cleared for this chat/user."); }

      // --- ROAST SETTINGS ---
      if (sub === "roastlevel") { const lvl = setRoastLevel(m, rest); if (!lvl) return sendText(m, "Use: gost roastlevel soft|medium|savage"); return sendText(m, `Roast level set: ${lvl}`); }

      // --- WEATHER ---
      if (sub === "setcity") { if (!rest) return sendText(m, "Use: gost setcity <city>"); setPrefs(m, { city: rest }); return sendText(m, `Default city set: ${rest}`); }
      if (sub === "weather") {
        const prefs = getPrefs(m);
        const city = rest || prefs.city;
        if (!city) return sendText(m, "Use: gost weather <city>  (or set default with gost setcity <city>)");
        const rep = await getWeather(city);
        return sendText(m, rep);
      }

      // --- MUSIC ---
      if (sub === "music") {
        if (!rest) return sendText(m, "Use: gost music <song or artist>");
        const result = await searchMusic(rest);
        await sendText(m, result.text);
        if (result.preview && m?.client?.sendMessage) {
          try { return await m.client.sendMessage(getChatId(m), { audio: { url: result.preview }, mimetype: "audio/mp4" }, { quoted: m }); } catch {}
        }
        return null;
      }

      // --- SUMMARIZE ---
      if (sub === "summarize") {
        const quoted = m?.quoted;
        const qtxt = quoted?.text || quoted?.msg || "";
        if (!qtxt) return sendText(m, "Reply to a message then use: gost summarize");
        const out = await aiReply(m, `Summarize this:\n\n${qtxt}`, "summarize");
        return sendText(m, out);
      }

      // --- ROAST ---
      if (sub === "roast") {
        if (m?.mentionedJid?.length) {
          const user = m.mentionedJid[0];
          const roast = await doRoast(m, `@${user.split("@")[0]}`);
          return sendText(m, withMentions(`${roast}`, [user]));
        }
        const roast = await doRoast(m, "me");
        return sendText(m, roast);
      }
      if (sub === "lastroast") {
        const q = m?.quoted;
        if (!q) return sendText(m, "Reply to someone’s message, then use: gost lastroast");
        const user = q.sender;
        const roast = await doRoast(m, `@${String(user || "").split("@")[0] || "user"}`);
        return sendText(m, withMentions(`${roast}`, user ? [user] : []));
      }

      // --- AI MODES ---
      const modeMap = new Set(["chat", "coach", "writer", "coder", "translate"]);
      if (modeMap.has(sub)) {
        if (!rest) return sendText(m, `Use: ${p}gost ${sub} <message>`);
        const out = await aiReply(m, rest, sub);
        return sendText(m, out);
      }

      return sendText(m, `Unknown. Try: ${p}gost menu`);
    } catch (e) {
      return sendText(m, "❌ GOST error: " + (e?.message || e));
    }
  }
);

module.exports = {};