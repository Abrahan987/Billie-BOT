let handler = async (m, { conn, usedPrefix, command }) => {
    const message = "Feliz años nuevo espero y este año sea un año maravilloso para todos y que cumplan metas y sueños ATT ABRAHAN-M y Staff oficial";
    const videoUrl = "https://files.catbox.moe/li1723.mp4";

    await m.reply('Iniciando el envío del mensaje de año nuevo a todos los grupos desde el bot principal y todos los sub-bots...');

    const allConnections = [conn, ...global.conns];
    let successCount = 0;
    let failCount = 0;

    for (const botConn of allConnections) {
        if (!botConn.user) {
            console.error("Una conexión de sub-bot no es válida o está incompleta.");
            continue;
        }

        try {
            const groups = Object.values(botConn.chats).filter(chat => chat.id.endsWith('@g.us'));
            await m.reply(`El bot @${botConn.user.jid.split('@')[0]} está enviando mensajes a ${groups.length} grupos.`);

            for (const group of groups) {
                try {
                    const groupMetadata = await botConn.groupMetadata(group.id);
                    const participants = groupMetadata.participants.map(p => p.id);

                    await botConn.sendMessage(group.id, {
                        video: { url: videoUrl },
                        caption: message,
                        mentions: participants
                    });
                    successCount++;
                    // Adding a delay to avoid being flagged as spam
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    failCount++;
                    console.error(`Error enviando mensaje al grupo ${group.id} desde el bot ${botConn.user.jid}:`, err);
                }
            }
        } catch (err) {
            console.error(`Error procesando los grupos para el bot ${botConn.user.jid}:`, err);
            await m.reply(`Ocurrió un error al procesar los grupos para el bot @${botConn.user.jid.split('@')[0]}.`);
        }
    }

    await m.reply(`¡Envío de año nuevo completado!\n\n- Mensajes enviados: ${successCount}\n- Errores: ${failCount}`);
}

handler.help = ['añonuevo'];
handler.tags = ['owner'];
handler.command = /^(añonuevo)$/i;
handler.owner = true;

export default handler;
