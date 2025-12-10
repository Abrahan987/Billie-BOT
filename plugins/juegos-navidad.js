let apuestas = {}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    const date = new Date()
    const month = date.getMonth() + 1

    if (month !== 12) {
        return conn.reply(m.chat, 'Este comando solo está disponible en diciembre.', m)
    }

    if (command === 'buscar' || command === 'copitos') {
        const timeout = 600000 // 10 minutos
        if (!user.copitos) user.copitos = 0
        let lastCopitos = user.lastCopitos || 0

        if (new Date - lastCopitos < timeout) {
            let timeLeft = ((lastCopitos + timeout) - new Date()) / 1000
            return conn.reply(m.chat, `Debes esperar ${Math.ceil(timeLeft)} segundos para volver a buscar copitos.`, m)
        }

        let amount = Math.floor(Math.random() * 100) + 1
        user.copitos += amount
        user.lastCopitos = new Date * 1

        conn.reply(m.chat, `¡Has encontrado ${amount} copitos de nieve! ❄️\nAhora tienes ${user.copitos} copitos en total.`, m)

    } else if (command === 'apostar') {
        let opponent
        let amount

        if (m.mentionedJid[0]) {
            opponent = m.mentionedJid[0]
            amount = parseInt(text.replace(/<@!*(\d+)>|@(\d+)|[\s,.]/g, ''))
        } else if (m.quoted) {
            opponent = m.quoted.sender
            amount = parseInt(text)
        } else {
            return conn.reply(m.chat, `Menciona a un usuario y la cantidad de copitos a apostar. Ejemplo: ${usedPrefix}apostar 100 @usuario`, m)
        }

        if (isNaN(amount) || amount <= 0) return conn.reply(m.chat, 'La cantidad de copitos a apostar debe ser un número mayor a 0.', m)
        if (!opponent) return conn.reply(m.chat, 'Debes mencionar a un oponente.', m)
        if (opponent === m.sender) return conn.reply(m.chat, 'No puedes apostar contra ti mismo.', m)

        let opponentUser = global.db.data.users[opponent]
        if (!opponentUser) return conn.reply(m.chat, 'El oponente no está en la base de datos.', m)

        if (!user.copitos || user.copitos < amount) return conn.reply(m.chat, `No tienes suficientes copitos para apostar esa cantidad. Tienes ${user.copitos || 0} copitos.`, m)
        if (!opponentUser.copitos || opponentUser.copitos < amount) return conn.reply(m.chat, `Tu oponente no tiene suficientes copitos para aceptar la apuesta.`, m)

        const key = `${m.sender}-${opponent}`
        const reverseKey = `${opponent}-${m.sender}`

        if (apuestas[reverseKey] && apuestas[reverseKey].amount === amount) {
            delete apuestas[reverseKey]

            let winner = Math.random() < 0.5 ? m.sender : opponent
            let loser = winner === m.sender ? opponent : m.sender

            global.db.data.users[winner].copitos += amount
            global.db.data.users[loser].copitos -= amount

            conn.reply(m.chat, `¡La apuesta ha sido aceptada!\n\n${conn.getName(winner)} ha ganado ${amount} copitos de ${conn.getName(loser)}! ❄️`, m, { mentions: [winner, loser] })

        } else {
            apuestas[key] = {
                from: m.sender,
                to: opponent,
                amount: amount,
                timestamp: Date.now()
            }
            conn.reply(m.chat, `${conn.getName(m.sender)} ha apostado ${amount} copitos contra ${conn.getName(opponent)}.`, m, { mentions: [m.sender, opponent] })
            conn.reply(opponent, `${conn.getName(m.sender)} te ha retado a una apuesta de ${amount} copitos. Responde con "${usedPrefix}apostar ${amount} @${m.sender.split('@')[0]}" para aceptar.`, m, { mentions: [m.sender, opponent] })
        }
    }
}

handler.help = ['buscar', 'apostar']
handler.tags = ['juegos']
handler.command = ['buscar', 'copitos', 'apostar']
handler.group = true

export default handler