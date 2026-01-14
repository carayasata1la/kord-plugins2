let game = null

const questionsBank = [
  {
    pic: `
   __
  |  |
  |__|`,
    options: ["Square", "Rectangle", "Box", "Window"],
    answer: "A"
  },
  {
    pic: `
    /\\
   /  \\
  /____\\`,
    options: ["Roof", "Triangle", "Arrow", "Mountain"],
    answer: "B"
  },
  {
    pic: `
   /\\_/\\
  ( o.o )
   > ^ <`,
    options: ["Dog", "Cat", "Fox", "Rabbit"],
    answer: "B"
  },
  {
    pic: `
   ____
  |____|
     ||
     ||`,
    options: ["Chair", "Table", "Hammer", "Key"],
    answer: "C"
  },
  {
    pic: `
    __
   |__|
   |__|
   |__|`,
    options: ["Drawer", "Tower", "Books", "Stairs"],
    answer: "D"
  }
]

// shuffle questions
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5)
}

async function nextTurn(sock) {
  if (!game) return

  if (game.players.length === 1) {
    await sock.sendMessage(game.group, {
      text: `🏆 *GAME OVER*\nWinner: @${game.players[0].split("@")[0]}`,
      mentions: game.players
    })
    game = null
    return
  }

  game.turn = game.turn % game.players.length
  const player = game.players[game.turn]
  const q = game.questions.pop()

  game.currentAnswer = q.answer
  game.currentPlayer = player

  await sock.sendMessage(game.group, {
    text:
`🎯 *YOUR TURN*
@${player.split("@")[0]}

Guess the picture:

${q.pic}

A) ${q.options[0]}
B) ${q.options[1]}
C) ${q.options[2]}
D) ${q.options[3]}

Reply with:
.answer A/B/C/D

⏱ 30 seconds`,
    mentions: [player]
  })

  game.timer = setTimeout(async () => {
    await sock.sendMessage(game.group, {
      text: `⏱ TIME UP!\n@${player.split("@")[0]} is OUT ❌`,
      mentions: [player]
    })
    game.players.splice(game.turn, 1)
    await nextTurn(sock)
  }, 30000)
}

module.exports = {
  name: "meg",
  commands: ["megstart", "join", "answer"],

  handler: async (m, { sock, command, args }) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid

    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ Group only game." })
    }

    // START
    if (command === "megstart") {
      if (game) {
        return sock.sendMessage(from, { text: "⚠️ A game is already running." })
      }

      game = {
        group: from,
        players: [],
        started: false,
        turn: 0,
        questions: shuffle([...questionsBank])
      }

      await sock.sendMessage(from, {
        text:
`🎮 *LINE PICTURE GUESS GAME*
Need 3 players

Type:
.join

⏱ Auto-cancel in 1 minute`
      })

      setTimeout(() => {
        if (game && !game.started) {
          sock.sendMessage(from, { text: "⏱ Game cancelled (not enough players)." })
          game = null
        }
      }, 60000)
    }

    // JOIN
    if (command === "join") {
      if (!game || game.started) return

      if (game.players.includes(sender)) {
        return sock.sendMessage(from, { text: "⚠️ You already joined." })
      }

      game.players.push(sender)

      await sock.sendMessage(from, {
        text: `✅ Joined (${game.players.length}/3)`
      })

      if (game.players.length === 3) {
        game.started = true
        await sock.sendMessage(from, { text: "🔥 Game starting!" })
        await nextTurn(sock)
      }
    }

    // ANSWER
    if (command === "answer") {
      if (!game || !game.started) return
      if (sender !== game.currentPlayer) return

      const userAns = args[0]?.toUpperCase()
      clearTimeout(game.timer)

      if (userAns === game.currentAnswer) {
        await sock.sendMessage(from, { text: "✅ Correct!" })
        game.turn++
      } else {
        await sock.sendMessage(from, {
          text: `❌ Wrong! Correct answer was ${game.currentAnswer}\nYou are OUT`
        })
        game.players.splice(game.turn, 1)
      }

      await nextTurn(sock)
    }
  }
}