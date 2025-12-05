import { fileTypeFromBuffer } from 'file-type';
import { jidDecode } from '@whiskeysockets/baileys';
import util from 'util';

export function protoType() {
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i];
        }
        return ab;
    };
    Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
        return this.buffer.slice(
            this.byteOffset,
            this.byteOffset + this.byteLength,
        );
    };
    ArrayBuffer.prototype.toBuffer = function toBuffer() {
        return Buffer.from(new Uint8Array(this));
    };
    Uint8Array.prototype.getFileType =
        ArrayBuffer.prototype.getFileType =
        Buffer.prototype.getFileType =
        async function getFileType() {
            return await fileTypeFromBuffer(this);
        };
    String.prototype.isNumber = Number.prototype.isNumber = isNumber;
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1, this.length);
    };
    String.prototype.capitalizeV2 = function capitalizeV2() {
        const str = this.split(" ");
        return str.map((v) => v.capitalize()).join(" ");
    };
    String.prototype.decodeJid = function decodeJid() {
        if (/:\d+@/gi.test(this)) {
            const decode = jidDecode(this) || {};
            return (
                (decode.user && decode.server && decode.user + "@" + decode.server) ||
                this
            ).trim();
        } else return this.trim();
    };
    Number.prototype.toTimeString = function toTimeString() {
        const seconds = Math.floor((this / 1000) % 60);
        const minutes = Math.floor((this / (60 * 1000)) % 60);
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24);
        const days = Math.floor(this / (24 * 60 * 60 * 1000));
        return (
            (days ? `${days} day(s) ` : "") +
            (hours ? `${hours} hour(s) ` : "") +
            (minutes ? `${minutes} minute(s) ` : "") +
            (seconds ? `${seconds} second(s)` : "")
        ).trim();
    };
    Number.prototype.getRandom =
        String.prototype.getRandom =
        Array.prototype.getRandom =
        getRandom;
}

function isNumber() {
    const int = parseInt(this);
    return typeof int === "number" && !isNaN(int);
}

function getRandom() {
    if (Array.isArray(this) || this instanceof String)
        return this[Math.floor(Math.random() * this.length)];
    return Math.floor(Math.random() * this);
}