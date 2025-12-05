import { proto } from "@whiskeysockets/baileys"
const { areJidsSameUser, jidDecode } = (await import('@whiskeysockets/baileys')).default

export function smsg(conn, m, hasParent) {
    if (!m) return m;
    const M = proto.WebMessageInfo;
    try {
        m = M.fromObject(m);
        m.conn = conn;
        let protocolMessageKey;
        if (m.message) {
            if (m.mtype == "protocolMessage" && m.msg?.key) {
                protocolMessageKey = m.msg.key;
                if (protocolMessageKey.remoteJid === "status@broadcast") {
                    protocolMessageKey.remoteJid = m.chat || "";
                }
                if (
                    !protocolMessageKey.participant ||
                    protocolMessageKey.participant === "status_me"
                ) {
                    protocolMessageKey.participant =
                        typeof m.sender === "string" ? m.sender : "";
                }
                const decodedParticipant =
                    conn?.decodeJid?.(protocolMessageKey.participant) || "";
                protocolMessageKey.fromMe =
                    decodedParticipant === (conn?.user?.id || "");
                if (
                    !protocolMessageKey.fromMe &&
                    protocolMessageKey.remoteJid === (conn?.user?.id || "")
                ) {
                    protocolMessageKey.remoteJid =
                        typeof m.sender === "string" ? m.sender : "";
                }
            }
            if (m.quoted && !m.quoted.mediaMessage) {
                delete m.quoted.download;
            }
        }
        if (!m.mediaMessage) {
            delete m.download;
        }
        if (protocolMessageKey && m.mtype == "protocolMessage") {
            try {
                conn.ev.emit("message.delete", protocolMessageKey);
            } catch (e) {
                console.error("Error al emitir message.delete:", e);
            }
        }
        return m;
    } catch (e) {
        console.error("Error en smsg:", e);
        return m;
    }
}

export function serialize() {
    const MediaType = ["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"];
    const safeEndsWith = (str, suffix) =>
        typeof str === "string" && str.endsWith(suffix);
    const safeDecodeJid = (jid, conn) => {
        try {
            if (!jid || typeof jid !== "string") return "";
            return conn?.decodeJid?.(jid) || jid;
        } catch (e) {
            console.error("Error en safeDecodeJid:", e);
            return "";
        }
    };
    const safeSplit = (str, separator) =>
        typeof str === "string" ? str.split(separator) : [];

    return Object.defineProperties(proto.WebMessageInfo.prototype, {
        conn: {
            value: undefined,
            enumerable: false,
            writable: true,
        },
        id: {
            get() {
                try {
                    return this.key?.id || "";
                } catch (e) {
                    console.error("Error en id getter:", e);
                    return "";
                }
            },
            enumerable: true,
        },
        isBaileys: {
            get() {
                try {
                    const userId = this.conn?.user?.id || "";
                    const sender = this.sender || "";
                    const messageId = this.id || "";
                    const isFromBot = this?.fromMe || areJidsSameUser(userId, sender);
                    const baileysStarts = ['NJX-', 'Lyru-', 'META-', 'EvoGlobalBot-', 'FizzxyTheGreat-', 'BAE5', '3EB0', 'B24E', '8SCO', 'SUKI', 'MYSTIC-'];
                    const hasKnownPrefix = baileysStarts.some(prefix => messageId.startsWith(prefix));
                    const isSukiPattern = /^SUKI[A-F0-9]+$/.test(messageId);
                    const isMysticPattern = /^MYSTIC[A-F0-9]+$/.test(messageId);
                    return isMysticPattern || isSukiPattern || hasKnownPrefix || false;
                } catch (e) {
                    console.error("Error en isBaileys getter:", e);
                    return false;
                }
            },
            enumerable: true,
        },
        chat: {
            get() {
                try {
                    const senderKeyDistributionMessage =
                        this.message?.senderKeyDistributionMessage?.groupId;
                    const rawJid =
                        this.key?.remoteJid ||
                        (senderKeyDistributionMessage &&
                            senderKeyDistributionMessage !== "status@broadcast") ||
                        "";
                    return safeDecodeJid(rawJid, this.conn);
                } catch (e) {
                    console.error("Error en chat getter:", e);
                    return "";
                }
            },
            enumerable: true,
        },
        isGroup: {
            get() {
                try {
                    return safeEndsWith(this.chat, "@g.us");
                } catch (e) {
                    console.error("Error en isGroup getter:", e);
                    return false;
                }
            },
            enumerable: true,
        },
        sender: {
            get() {
                return this.conn?.decodeJid(this.key?.fromMe && this.conn?.user.id || this.participant || this.key.participant || this.chat || '');
            },
            enumerable: true,
        },
        fromMe: {
            get() {
                try {
                    const userId = this.conn?.user?.jid || "";
                    const sender = this.sender || "";
                    return this.key?.fromMe || areJidsSameUser(userId, sender) || false;
                } catch (e) {
                    console.error("Error en fromMe getter:", e);
                    return false;
                }
            },
            enumerable: true,
        },
        mtype: {
            get() {
                try {
                    if (!this.message) return "";
                    const type = Object.keys(this.message);

                    if (
                        !["senderKeyDistributionMessage", "messageContextInfo"].includes(
                            type[0],
                        )
                    ) {
                        return type[0];
                    }

                    if (type.length >= 3 && type[1] !== "messageContextInfo") {
                        return type[1];
                    }

                    return type[type.length - 1];
                } catch (e) {
                    console.error("Error en mtype getter:", e);
                    return "";
                }
            },
            enumerable: true,
        },
        msg: {
            get() {
                try {
                    if (!this.message) return null;
                    return this.message[this.mtype] || null;
                } catch (e) {
                    console.error("Error en msg getter:", e);
                    return null;
                }
            },
            enumerable: true,
        },
        mediaMessage: {
            get() {
                try {
                    if (!this.message) return null;

                    const Message =
                        (this.msg?.url || this.msg?.directPath ?
                            { ...this.message
                            } :
                            extractMessageContent(this.message)) || null;
                    if (!Message) return null;

                    const mtype = Object.keys(Message)[0];
                    return MediaType.includes(mtype) ? Message : null;
                } catch (e) {
                    console.error("Error en mediaMessage getter:", e);
                    return null;
                }
            },
            enumerable: true,
        },
        mediaType: {
            get() {
                try {
                    const message = this.mediaMessage;
                    if (!message) return null;
                    return Object.keys(message)[0];
                } catch (e) {
                    console.error("Error en mediaType getter:", e);
                    return null;
                }
            },
            enumerable: true,
        },
        quoted: {
            get() {
                try {
                    const self = this;
                    const msg = self.msg;
                    const contextInfo = msg?.contextInfo;
                    const quoted = contextInfo?.quotedMessage;

                    if (!msg || !contextInfo || !quoted) return null;

                    const type = Object.keys(quoted)[0];
                    const q = quoted[type];
                    const text = typeof q === "string" ? q : q?.text || "";

                    return Object.defineProperties(
                        JSON.parse(
                            JSON.stringify(typeof q === "string" ? {
                                text: q
                            } : q || {}),
                        ), {
                            mtype: {
                                get() {
                                    return type;
                                },
                                enumerable: true,
                            },
                            mediaMessage: {
                                get() {
                                    const Message =
                                        (q?.url || q?.directPath ?
                                            { ...quoted
                                            } :
                                            extractMessageContent(quoted)) || null;
                                    if (!Message) return null;
                                    const mtype = Object.keys(Message)[0];
                                    return MediaType.includes(mtype) ? Message : null;
                                },
                                enumerable: true,
                            },
                            mediaType: {
                                get() {
                                    const message = this.mediaMessage;
                                    if (!message) return null;
                                    return Object.keys(message)[0];
                                },
                                enumerable: true,
                            },
                            id: {
                                get() {
                                    return contextInfo.stanzaId || "";
                                },
                                enumerable: true,
                            },
                            chat: {
                                get() {
                                    return contextInfo.remoteJid || self.chat || "";
                                },
                                enumerable: true,
                            },
                            isBaileys: {
                                get() {
                                    const userId = self.conn?.user?.id || "";
                                    const sender = this.sender || "";
                                    const messageId = this.id || "";
                                    const isFromBot = this?.fromMe || areJidsSameUser(userId, sender);
                                    const baileysStarts = ['NJX-', 'Lyru-', 'META-', 'EvoGlobalBot-', 'FizzxyTheGreat-', 'BAE5', '3EB0', 'B24E', '8SCO', 'SUKI', 'MYSTIC-'];
                                    const hasKnownPrefix = baileysStarts.some(prefix => messageId.startsWith(prefix));
                                    const isSukiPattern = /^SUKI[A-F0-9]+$/.test(messageId);
                                    const isMysticPattern = /^MYSTIC[A-F0-9]+$/.test(messageId);
                                    return isMysticPattern || isSukiPattern || hasKnownPrefix || false;
                                },
                                enumerable: true,
                            },
                            sender: {
                                get() {
                                    try {
                                        const rawParticipant = contextInfo.participant;
                                        if (!rawParticipant) {
                                            const isFromMe =
                                                this.key?.fromMe ||
                                                areJidsSameUser(this.chat, self.conn?.user?.id || "");
                                            return isFromMe ?
                                                safeDecodeJid(self.conn?.user?.id, self.conn) :
                                                this.chat;
                                        }
                                        const parsedJid = safeDecodeJid(rawParticipant, self.conn);
                                        if (parsedJid && parsedJid.includes("@lid")) {
                                            const groupChatId = this.chat?.endsWith("@g.us") ? this.chat : null;
                                            if (groupChatId) {
                                                return String.prototype.resolveLidToRealJid.call(
                                                    parsedJid,
                                                    groupChatId,
                                                    self.conn
                                                );
                                            }
                                        }

                                        return parsedJid;
                                    } catch (e) {
                                        console.error("Error en quoted sender getter:", e);
                                        return "";
                                    }
                                },
                                enumerable: true,
                            },
                            fromMe: {
                                get() {
                                    const sender = this.sender || "";
                                    const userJid = self.conn?.user?.jid || "";
                                    return areJidsSameUser(sender, userJid);
                                },
                                enumerable: true,
                            },
                            text: {
                                get() {
                                    return (
                                        text ||
                                        this.caption ||
                                        this.contentText ||
                                        this.selectedDisplayText ||
                                        ""
                                    );
                                },
                                enumerable: true,
                            },
                            mentionedJid: {
                                get() {
                                    const mentioned =
                                        q?.contextInfo?.mentionedJid ||
                                        self.getQuotedObj()?.mentionedJid || [];
                                    const groupChatId = this.chat?.endsWith("@g.us") ? this.chat : null;

                                    const processJid = (user) => {
                                        try {
                                            if (user && typeof user === "object") {
                                                user = user.lid || user.jid || user.id || "";
                                            }
                                            if (typeof user === "string" && user.includes("@lid") && groupChatId) {
                                                const resolved = String.prototype.resolveLidToRealJid.call(
                                                    user,
                                                    groupChatId,
                                                    self.conn
                                                );
                                                return resolved.then(res => typeof res === "string" ? res : user);
                                            }
                                            return Promise.resolve(user);
                                        } catch (e) {
                                            console.error("Error processing JID:", user, e);
                                            return Promise.resolve(user);
                                        }
                                    };
                                    const processed = mentioned.map(processJid);
                                    return Promise.all(processed)
                                        .then(jids => jids.filter(jid => jid && typeof jid === "string"))
                                        .catch(e => {
                                            console.error("Error in mentionedJid processing:", e);
                                            return mentioned.filter(jid => jid && typeof jid === "string");
                                        });
                                },
                                enumerable: true,
                            },
                            name: {
                                get() {
                                    const sender = this.sender;
                                    return sender ? self.conn?.getName?.(sender) : null;
                                },
                                enumerable: true,
                            },
                            vM: {
                                get() {
                                    return proto.WebMessageInfo.fromObject({
                                        key: {
                                            fromMe: this.fromMe,
                                            remoteJid: this.chat,
                                            id: this.id,
                                        },
                                        message: quoted,
                                        ...(self.isGroup ? {
                                            participant: this.sender
                                        } : {}),
                                    });
                                },
                                enumerable: true,
                            },
                            fakeObj: {
                                get() {
                                    return this.vM;
                                },
                                enumerable: true,
                            },
                            download: {
                                value(saveToFile = false) {
                                    const mtype = this.mediaType;
                                    return self.conn?.downloadM?.(
                                        this.mediaMessage?.[mtype],
                                        mtype?.replace(/message/i, ""),
                                        saveToFile,
                                    );
                                },
                                enumerable: true,
                                configurable: true,
                            },
                            reply: {
                                value(text, chatId, options) {
                                    return self.conn?.reply?.(
                                        chatId ? chatId : this.chat,
                                        text,
                                        this.vM,
                                        options,
                                    );
                                },
                                enumerable: true,
                            },
                            copy: {
                                value() {
                                    const M = proto.WebMessageInfo;
                                    return smsg(self.conn, M.fromObject(M.toObject(this.vM)));
                                },
                                enumerable: true,
                            },
                            forward: {
                                value(jid, force = false, options) {
                                    return self.conn?.sendMessage?.(
                                        jid, {
                                            forward: this.vM,
                                            force,
                                            ...options,
                                        }, {
                                            ...options
                                        },
                                    );
                                },
                                enumerable: true,
                            },
                            copyNForward: {
                                value(jid, forceForward = false, options) {
                                    return self.conn?.copyNForward?.(
                                        jid,
                                        this.vM,
                                        forceForward,
                                        options,
                                    );
                                },
                                enumerable: true,
                            },
                            cMod: {
                                value(jid, text = "", sender = this.sender, options = {}) {
                                    return self.conn?.cMod?.(jid, this.vM, text, sender, options);
                                },
                                enumerable: true,
                            },
                            delete: {
                                value() {
                                    return self.conn?.sendMessage?.(this.chat, {
                                        delete: this.vM.key,
                                    });
                                },
                                enumerable: true,
                            },
                        },
                    );
                } catch (e) {
                    console.error("Error en quoted getter:", e);
                    return null;
                }
            },
            enumerable: true,
        },
        _text: {
            value: null,
            writable: true,
            enumerable: true,
        },
        text: {
            get() {
                try {
                    const msg = this.msg;
                    const text =
                        (typeof msg === "string" ? msg : msg?.text) ||
                        msg?.caption ||
                        msg?.contentText ||
                        "";
                    return typeof this._text === "string" ?
                        this._text :
                        "" ||
                        (typeof text === "string" ?
                            text :
                            text?.selectedDisplayText ||
                            text?.hydratedTemplate?.hydratedContentText ||
                            text) ||
                        "";
                } catch (e) {
                    console.error("Error en text getter:", e);
                    return "";
                }
            },
            set(str) {
                this._text = str;
            },
            enumerable: true,
        },
        mentionedJid: {
            get() {
                try {
                    const mentioned = this.msg?.contextInfo?.mentionedJid || [];
                    const groupChatId = this.chat?.endsWith("@g.us") ? this.chat : null;

                    const processJid = (user) => {
                        try {
                            if (user && typeof user === "object") {
                                user = user.lid || user.jid || user.id || "";
                            }
                            if (typeof user === "string" && user.includes("@lid") && groupChatId) {
                                const resolved = String.prototype.resolveLidToRealJid.call(
                                    user,
                                    groupChatId,
                                    this.conn
                                );
                                return resolved.then(res => typeof res === "string" ? res : user);
                            }
                            return Promise.resolve(user);
                        } catch (e) {
                            console.error("Error processing JID:", user, e);
                            return Promise.resolve(user);
                        }
                    };

                    const processed = mentioned.map(processJid);

                    return Promise.all(processed)
                        .then(jids => jids.filter(jid => jid && typeof jid === "string"))
                        .catch(e => {
                            console.error("Error en mentionedJid getter:", e);
                            return [];
                        });
                } catch (e) {
                    console.error("Error en mentionedJid getter:", e);
                    return Promise.resolve([]);
                }
            },
            enumerable: true,
        },
        name: {
            get() {
                try {
                    if (!nullish(this.pushName) && this.pushName) return this.pushName;
                    const sender = this.sender;
                    return sender ? this.conn?.getName?.(sender) : "";
                } catch (e) {
                    console.error("Error en name getter:", e);
                    return "";
                }
            },
            enumerable: true,
        },
        download: {
            value(saveToFile = false) {
                try {
                    const mtype = this.mediaType;
                    return this.conn?.downloadM?.(
                        this.mediaMessage?.[mtype],
                        mtype?.replace(/message/i, ""),
                        saveToFile,
                    );
                } catch (e) {
                    console.error("Error en download:", e);
                    return Promise.reject(e);
                }
            },
            enumerable: true,
            configurable: true,
        },
        reply: {
            value(text, chatId, options) {
                try {
                    return this.conn?.reply?.(
                        chatId ? chatId : this.chat,
                        text,
                        this,
                        options,
                    );
                } catch (e) {
                    console.error("Error en reply:", e);
                    return Promise.reject(e);
                }
            },
            enumerable: true,
        },
        copy: {
            value() {
                try {
                    const M = proto.WebMessageInfo;
                    return smsg(this.conn, M.fromObject(M.toObject(this)));
                } catch (e) {
                    console.error("Error en copy:", e);
                    return null;
                }
            },
            enumerable: true,
        },
        forward: {
            value(jid, force = false, options = {}) {
                try {
                    return this.conn?.sendMessage?.(
                        jid, {
                            forward: this,
                            force,
                            ...options,
                        }, {
                            ...options
                        },
                    );
                } catch (e) {
                    console.error("Error en forward:", e);
                    return Promise.reject(e);
                }
            },
            enumerable: true,
        },
        copyNForward: {
            value(jid, forceForward = false, options = {}) {
                try {
                    return this.conn?.copyNForward?.(jid, this, forceForward, options);
                } catch (e) {
                    console.error("Error en copyNForward:", e);
                    return Promise.reject(e);
                }
            },
            enumerable: true,
        },
        cMod: {
            value(jid, text = "", sender = this.sender, options = {}) {
                try {
                    return this.conn?.cMod?.(jid, this, text, sender, options);
                } catch (e) {
                    console.error("Error en cMod:", e);
                    return Promise.reject(e);
                }
            },
            enumerable: true,
        },
        getQuotedObj: {
            value() {
                try {
                    if (!this.quoted?.id) return null;
                    const q = proto.WebMessageInfo.fromObject(
                        this.conn?.loadMessage?.(this.quoted.id) || this.quoted.vM || {},
                    );
                    return smsg(this.conn, q);
                } catch (e) {
                    console.error("Error en getQuotedObj:", e);
                    return null;
                }
            },
            enumerable: true,
        },
        getQuotedMessage: {
            get() {
                return this.getQuotedObj;
            },
            enumerable: true,
        },
        delete: {
            value() {
                try {
                    return this.conn?.sendMessage?.(this.chat, {
                        delete: this.key
                    });
                } catch (e) {
                    console.error("Error en delete:", e);
                    return Promise.reject(e);
                }
            },
            enumerable: true,
        },
        react: {
            value(text) {
                return this.conn?.sendMessage(this.chat, {
                    react: {
                        text,
                        key: this.key
                    }
                })
            },
            enumerable: true
        }
    });
}