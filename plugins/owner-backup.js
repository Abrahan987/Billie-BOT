import fs from 'fs';
import archiver from 'archiver';

let handler = async (m, { conn }) => {
try {
await m.react('🕒');
const backupDir = './backup';
if (!fs.existsSync(backupDir)) {
fs.mkdirSync(backupDir);
}

const date = new Date().toISOString().split('T')[0];
const backupFileName = `backup-${date}.zip`;
const outputPath = `${backupDir}/${backupFileName}`;
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
// Añadir archivos importantes al backup
archive.file('./database.json', { name: 'database.json' });
archive.directory('./sessions/', 'sessions');
// Puedes añadir más archivos o carpetas aquí

await archive.finalize();

output.on('close', async () => {
await conn.sendFile(m.sender, outputPath, backupFileName, `*✅ Respaldo completado.*\n\nAquí tienes el respaldo del ${date}.`, m);
await m.react('✔️');
// Opcional: eliminar el archivo zip después de enviarlo
// fs.unlinkSync(outputPath);
});

output.on('error', (err) => {
throw err;
});

} catch (error) {
await m.react('✖️');
console.error("Error al crear el respaldo:", error);
await conn.reply(m.chat, "☂︎ ¡Oh, no! Ocurrió un error al crear el respaldo.", m);
}};

handler.help = ['backup'];
handler.tags = ['owner'];
handler.command = ['backup', 'respaldo'];
handler.owner = true;

export default handler;