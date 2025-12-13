import jimp from 'jimp';

async function generateWelcomeCard({ ppUrl, groupName, memberCount }) {
// Implementación de bienvenida con jimp
const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
const background = await jimp.read('https://i.imgur.com/2p2cW1V.png'); // Un fondo genérico
const avatar = await jimp.read(ppUrl || 'https://i.imgur.com/8aM0B7v.png');

avatar.resize(150, 150);
background.resize(500, 250);

background.print(font, 170, 150, `¡Bienvenido/a!`);
background.print(font, 170, 190, groupName);
background.composite(avatar, 10, 50);

return await background.getBufferAsync(jimp.MIME_PNG);
}

async function generateByeCard({ ppUrl, groupName, userName }) {
// Implementación de despedida con jimp
const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
const background = await jimp.read('https://i.imgur.com/2p2cW1V.png'); // Un fondo genérico
const avatar = await jimp.read(ppUrl || 'https://i.imgur.com/8aM0B7v.png');

avatar.resize(150, 150);
background.resize(500, 250);

background.print(font, 170, 150, `¡Adiós, ${userName}!`);
background.print(font, 170, 190, `Salió de ${groupName}`);
background.composite(avatar, 10, 50);

return await background.getBufferAsync(jimp.MIME_PNG);
}

export { generateWelcomeCard as bienvenida, generateByeCard as despedida };