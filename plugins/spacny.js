import axios from "axios";
import FormData from "form-data";
import { spacny } from "../config.js";

let handler = async (m, { conn }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || quoted.mediaType || "";

    if (!/image\/(jpe?g|png)/i.test(mime)) {
      return conn.reply(m.chat, "❗ Envía o responde una imagen para subirla.", m);
    }

    // Descargar imagen del mensaje
    const buffer = await quoted.download();

    // FormData
    const form = new FormData();
    form.append("file", buffer, "spacny_upload.jpg");

    // Enviar al hosting
    const res = await axios.post(
      "https://spacny.wuaze.com/api_upload.php",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "X-KEY": spacny.key,
          "Cookie": spacny.cookie,
          "User-Agent": "SpacnyUploader/1.0",
          "Accept": "application/json"
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    // Respuesta del servidor
    const data = res.data;

    // Si tu API devuelve { url: "..." }
    if (data?.url) {
      return conn.reply(
        m.chat,
        `✔ Archivo subido correctamente:\n${data.url}`,
        m
      );
    }

    // Si devuelve otra estructura
    return conn.reply(m.chat, `Respuesta del servidor:\n${JSON.stringify(data, null, 2)}`, m);

  } catch (err) {
    console.log(err);
    return conn.reply(m.chat, `❌ Error: ${err.response?.data || err.message}`, m);
  }
};

handler.help = ["spacny"];
handler.tags = ["tools"];
handler.command = /^spacny$/i;

export default handler;
