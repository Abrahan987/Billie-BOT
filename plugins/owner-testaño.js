let handler = async (m, { conn, usedPrefix, command }) => {
    const message = "Feliz años nuevo espero y este año sea un año maravilloso para todos y que cumplan metas y sueños ATT ABRAHAN-M y Staff oficial";
    const videoUrl = "https://files.catbox.moe/li1723.mp4";
    const testGroups = ['120363419877108426@g.us', '120363421362426518@g.us'];

    await m.reply('Iniciando el envío de prueba a los grupos especificados...');

    try {
        for (const groupId of testGroups) {
            try {
                const groupMetadata = await conn.groupMetadata(groupId);
                const participants = groupMetadata.participants.map(p => p.id);

                await conn.sendMessage(groupId, {
                    video: { url: videoUrl },
                    caption: message,
                    mentions: participants
                });

                await m.reply(`Mensaje de prueba enviado exitosamente a ${groupMetadata.subject} (${groupId})`);

                // Adding a delay to avoid being flagged as spam
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (err) {
                console.error(`Error sending message to group ${groupId}:`, err);
                await m.reply(`Falló el envío al grupo ${groupId}. Revisa la consola para más detalles.`);
            }
        }

        await m.reply('¡Prueba de envío de año nuevo completada!');
    } catch (err) {
        console.error('Error general en el comando de prueba de año nuevo:', err);
        await m.reply('Ocurrió un error al intentar enviar los mensajes de prueba.');
    }
}

handler.help = ['testaño'];
handler.tags = ['owner'];
handler.command = /^(testaño)$/i;
handler.owner = true;

export default handler;
