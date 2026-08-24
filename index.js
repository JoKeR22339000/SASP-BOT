const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const Database = require("better-sqlite3");

const db = new Database(
    path.join(__dirname, "database", "mesai.db")
);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS personeller (
        id TEXT PRIMARY KEY,
        toplamMesai INTEGER DEFAULT 0,
        aktif INTEGER DEFAULT 0,
        baslangic INTEGER DEFAULT NULL
    )
`);

require("dotenv").config();


// ======================================================
// BOT
// ======================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});


// ======================================================
// MESAI DOSYASI
// ======================================================

const DATA_FILE = path.join(
    __dirname,
    "mesailer.json"
);

let veriler = {};


// ======================================================
// VERİLERİ YÜKLE
// ======================================================

function verileriYukle() {

    if (!fs.existsSync(DATA_FILE)) {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify({}, null, 4)
        );

        return {};
    }

    try {

        return JSON.parse(
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ mesailer.json okunamadı:",
            error
        );

        return {};
    }
}


// ======================================================
// VERİLERİ KAYDET
// ======================================================

function verileriKaydet() {

    try {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                veriler,
                null,
                4
            )
        );

    } catch (error) {

        console.error(
            "❌ Mesai verileri kaydedilemedi:",
            error
        );
    }
}


veriler = verileriYukle();


// ======================================================
// SÜRE FORMAT
// ======================================================

function sureFormatla(ms) {

    const toplamSaniye =
        Math.floor(ms / 1000);

    const saat =
        Math.floor(
            toplamSaniye / 3600
        );

    const dakika =
        Math.floor(
            (toplamSaniye % 3600) / 60
        );

    const saniye =
        toplamSaniye % 60;

    return `${saat} saat ${dakika} dakika ${saniye} saniye`;
}


// ======================================================
// KOMUTLAR
// ======================================================

const commands = [];

const commandsPath = path.join(
    __dirname,
    "commands"
);


if (fs.existsSync(commandsPath)) {

    const commandFiles =
        fs.readdirSync(commandsPath)
            .filter(
                file =>
                    file.endsWith(".js")
            );

    for (const file of commandFiles) {

        try {

            const command =
                require(
                    path.join(
                        commandsPath,
                        file
                    )
                );

            if (
                command.data &&
                command.execute
            ) {

                commands.push(command);

                console.log(
                    `✅ Komut yüklendi: /${command.data.name}`
                );
            }

        } catch (error) {

            console.error(
                `❌ ${file} yüklenemedi:`,
                error
            );
        }
    }
}


// ======================================================
// MESAI PANEL KOMUTU
// ======================================================

commands.push({

    data:
        new SlashCommandBuilder()
            .setName("mesai-panel")
            .setDescription(
                "SASP mesai panelini oluşturur."
            ),

    async execute(interaction) {

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "🚔 SASP MESAI SİSTEMİ"
                )
                .setDescription(
                    "SASP personelleri mesai işlemlerini aşağıdaki butonlardan gerçekleştirebilir.\n\n" +

                    "🟢 **Mesai Başlat**\n" +
                    "Aktif Memur ses kanalında mesainizi başlatır.\n\n" +

                    "🔴 **Mesai Bitir**\n" +
                    "Mesainizi sonlandırır.\n\n" +

                    "📊 **Mesaim**\n" +
                    "Kendi mesai bilgilerinizi gösterir.\n\n" +

                    "👮 **Aktif Personeller**\n" +
                    "Şu anda mesai yapan personelleri gösterir.\n\n" +

                    "🏆 **Mesai Top**\n" +
                    "Toplam mesai sıralamasını gösterir."
                )
                .setFooter({
                    text:
                        "San Andreas State Police • Mesai Sistemi"
                });

        const row1 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "mesai_baslat"
                        )
                        .setLabel(
                            "Mesai Başlat"
                        )
                        .setEmoji("🟢")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "mesai_bitir"
                        )
                        .setLabel(
                            "Mesai Bitir"
                        )
                        .setEmoji("🔴")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                );

        const row2 =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "mesaim"
                        )
                        .setLabel(
                            "Mesaim"
                        )
                        .setEmoji("📊")
                        .setStyle(
                            ButtonStyle.Primary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "aktif_personeller"
                        )
                        .setLabel(
                            "Aktif Personeller"
                        )
                        .setEmoji("👮")
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "mesai_top"
                        )
                        .setLabel(
                            "Mesai Top"
                        )
                        .setEmoji("🏆")
                        .setStyle(
                            ButtonStyle.Primary
                        )
                );

        await interaction.channel.send({

            embeds: [embed],

            components: [
                row1,
                row2
            ]

        });

        await interaction.reply({

            content:
                "✅ Mesai paneli oluşturuldu.",

            ephemeral: true

        });
    }
});


// ======================================================
// BOT READY
// ======================================================

client.once(
    Events.ClientReady,
    async () => {

        console.log(
            "=========================================="
        );

        console.log(
            `🚔 ${client.user.tag} aktif!`
        );

        console.log(
            "=========================================="
        );

        const rest =
            new REST({
                version: "10"
            }).setToken(
                process.env.TOKEN
            );

        try {

            await rest.put(

                Routes.applicationGuildCommands(

                    process.env.CLIENT_ID,

                    process.env.GUILD_ID

                ),

                {
                    body:
                        commands.map(
                            command =>
                                command.data.toJSON()
                        )
                }
            );

            console.log(
                "✅ Slash komutları yüklendi!"
            );

        } catch (error) {

            console.error(
                "❌ Slash komut yükleme hatası:",
                error
            );
        }
    }
);


// ======================================================
// SES KANALI - OTOMATİK MESAI BİTİR
// ======================================================

client.on(
    Events.VoiceStateUpdate,
    async (
        oldState,
        newState
    ) => {

        veriler =
            verileriYukle();

        const userId =
            newState.id;

        const personel =
            veriler[userId];

        if (
            !personel ||
            !personel.aktif
        ) return;

        const mesaiChannel =
            process.env.MESAI_VOICE_CHANNEL_ID;

        if (
            newState.channelId ===
            mesaiChannel
        ) return;

        if (
            !personel.baslangic
        ) return;

        const gecenSure =
            Date.now() -
            personel.baslangic;

        personel.toplamMesai +=
            gecenSure;

        personel.aktif =
            false;

        personel.baslangic =
            null;

        verileriKaydet();

        try {

            const user =
                await client.users.fetch(
                    userId
                );

            await user.send({

                content:

                    "❌ **MESAINİZ OTOMATİK SONLANDIRILDI**\n\n" +

                    "🚔 **Aktif Memur** kanalından ayrıldığınız için mesainiz otomatik olarak sonlandırılmıştır.\n\n" +

                    `⏱️ **Toplam mesainiz:** ${sureFormatla(
                        personel.toplamMesai
                    )}`

            });

        } catch {

            console.log(
                `⚠️ ${userId} kişisine otomatik mesai DM'i gönderilemedi.`
            );
        }
    }
);


// ======================================================
// INTERACTION
// ======================================================

client.on(
    Events.InteractionCreate,
    async interaction => {

        veriler =
            verileriYukle();


        // ==================================================
        // SLASH COMMAND
        // ==================================================

        if (
            interaction.isChatInputCommand()
        ) {

            const command =
                commands.find(
                    command =>
                        command.data.name ===
                        interaction.commandName
                );

            if (!command)
                return;

            try {

                await command.execute(
                    interaction
                );

            } catch (error) {

                console.error(error);

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({

                        content:
                            "❌ Bir hata oluştu.",

                        ephemeral: true

                    });

                } else {

                    await interaction.reply({

                        content:
                            "❌ Bir hata oluştu.",

                        ephemeral: true

                    });
                }
            }

            return;
        }


        // ==================================================
        // IC İSİM DEĞİŞTİR BUTONU
        // ==================================================

        if (
            interaction.isButton() &&
            interaction.customId ===
            "ic_isim_degistir"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "ic_isim_formu"
                    )
                    .setTitle(
                        "IC İsim Değişikliği"
                    );

            const input =
                new TextInputBuilder()
                    .setCustomId(
                        "yeni_ic_isim"
                    )
                    .setLabel(
                        "Yeni IC İsmin"
                    )
                    .setPlaceholder(
                        "02 - Ithan Armando | SASP"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true)
                    .setMinLength(5)
                    .setMaxLength(50);

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        input
                    )

            );

            await interaction.showModal(
                modal
            );

            return;
        }


        // ==================================================
        // IC İSİM FORMU
        // ==================================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId ===
            "ic_isim_formu"
        ) {

            const yeniIsim =
                interaction.fields
                    .getTextInputValue(
                        "yeni_ic_isim"
                    )
                    .trim();


            const format =
                /^(\d+)\s*-\s*(.+?)\s*\|\s*(.+)$/;


            const match =
                yeniIsim.match(
                    format
                );


            if (!match) {

                return interaction.reply({

                    content:

                        "❌ Geçersiz isim formatı!\n\n" +

                        "**Doğru format:**\n" +

                        "`02 - Ithan Armando | SASP`",

                    ephemeral: true

                });
            }


            const kod =
                match[1];

            const adSoyad =
                match[2].trim();

            const departman =
                match[3].trim();


            const logChannel =
                interaction.guild.channels.cache.get(
                    process.env.IC_ISIM_LOG_CHANNEL_ID
                );


            if (!logChannel) {

                return interaction.reply({

                    content:
                        "❌ IC isim log kanalı bulunamadı.",

                    ephemeral: true

                });
            }


            const unique =
                `${interaction.user.id}_${Date.now()}`;


            const row =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `ic_isim_onay_${unique}`
                            )
                            .setLabel(
                                "Onayla"
                            )
                            .setEmoji("✅")
                            .setStyle(
                                ButtonStyle.Success
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                `ic_isim_red_${unique}`
                            )
                            .setLabel(
                                "Reddet"
                            )
                            .setEmoji("❌")
                            .setStyle(
                                ButtonStyle.Danger
                            )

                    );


            const embed =
                new EmbedBuilder()
                    .setTitle(
                        "📝 İSİM DEĞİŞİKLİĞİ TALEBİ"
                    )
                    .setDescription(

                        `👤 **Talep Eden**\n${interaction.user} \`${interaction.user.id}\`\n\n` +

                        `📝 **Yeni İsim**\n\`${yeniIsim}\`\n\n` +

                        `🔢 **KOD**\n${kod}\n\n` +

                        `👮 **Ad Soyad**\n${adSoyad}\n\n` +

                        `🏢 **Departman**\n${departman}`

                    )
                    .setFooter({

                        text:
                            "STATE İsim Değişikliği Sistemi"

                    })
                    .setTimestamp();


            await logChannel.send({

                embeds: [
                    embed
                ],

                components: [
                    row
                ]

            });


            await interaction.reply({

                content:
                    "✅ İsim değişikliği talebin yetkili onayına gönderildi.",

                ephemeral: true

            });

            return;
        }


        // ==================================================
        // IC İSİM REDDET
        // ==================================================

        if (
            interaction.isButton() &&
            interaction.customId.startsWith(
                "ic_isim_red_"
            )
        ) {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageGuild
                )
            ) {

                return interaction.reply({

                    content:
                        "❌ Bu işlemi yapmak için yetkin yok.",

                    ephemeral: true

                });
            }


            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `ic_isim_red_modal_${interaction.message.id}`
                    )
                    .setTitle(
                        "İsim Değişikliği Reddi"
                    );


            const input =
                new TextInputBuilder()
                    .setCustomId(
                        "red_sebebi"
                    )
                    .setLabel(
                        "Red Sebebi"
                    )
                    .setPlaceholder(
                        "Örn: İsim formatı uygun değil."
                    )
                    .setStyle(
                        TextInputStyle.Paragraph
                    )
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(500);


            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        input
                    )

            );


            await interaction.showModal(
                modal
            );

            return;
        }


        // ==================================================
        // IC İSİM RED MODAL
        // ==================================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId.startsWith(
                "ic_isim_red_modal_"
            )
        ) {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageGuild
                )
            ) {

                return interaction.reply({

                    content:
                        "❌ Bu işlemi yapmak için yetkin yok.",

                    ephemeral: true

                });
            }


            const messageId =
                interaction.customId.replace(
                    "ic_isim_red_modal_",
                    ""
                );


            const redSebebi =
                interaction.fields
                    .getTextInputValue(
                        "red_sebebi"
                    )
                    .trim();


            let message;

            try {

                message =
                    await interaction.channel.messages.fetch(
                        messageId
                    );

            } catch {

                return interaction.reply({

                    content:
                        "❌ İsim değişikliği talebi bulunamadı.",

                    ephemeral: true

                });
            }


            if (
                !message.embeds.length
            ) {

                return interaction.reply({

                    content:
                        "❌ Talep bilgileri bulunamadı.",

                    ephemeral: true

                });
            }


            const description =
                message.embeds[0].description;


            const userMatch =
                description.match(
                    /<@!?(\d+)>/
                );


            const isimMatch =
                description.match(
                    /Yeni İsim\*\*\n`([^`]+)`/
                );


            const kodMatch =
                description.match(
                    /KOD\*\*\n(.+)/
                );


            const adMatch =
                description.match(
                    /Ad Soyad\*\*\n(.+)/
                );


            const departmanMatch =
                description.match(
                    /Departman\*\*\n(.+)/
                );


            if (
                !userMatch ||
                !isimMatch
            ) {

                return interaction.reply({

                    content:
                        "❌ Talep bilgileri okunamadı.",

                    ephemeral: true

                });
            }


            const userId =
                userMatch[1];

            const yeniIsim =
                isimMatch[1];

            const kod =
                kodMatch
                    ? kodMatch[1].trim()
                    : "Bilinmiyor";

            const adSoyad =
                adMatch
                    ? adMatch[1].trim()
                    : "Bilinmiyor";

            const departman =
                departmanMatch
                    ? departmanMatch[1].trim()
                    : "Bilinmiyor";


            const tarih =
                new Date();

            const saat =
                tarih.toLocaleTimeString(
                    "tr-TR",
                    {
                        timeZone:
                            "Europe/Istanbul",
                        hour:
                            "2-digit",
                        minute:
                            "2-digit"
                    }
                );


            const embed =
                new EmbedBuilder()
                    .setTitle(
                        "❌ İSİM DEĞİŞİKLİĞİ REDDEDİLDİ"
                    )
                    .setDescription(

                        `👤 **Talep Eden**\n<@${userId}> \`${userId}\`\n\n` +

                        `📝 **Yeni İsim**\n\`${yeniIsim}\`\n\n` +

                        `🔢 **KOD**\n${kod}\n\n` +

                        `👮 **Ad Soyad**\n${adSoyad}\n\n` +

                        `🏢 **Departman**\n${departman}\n\n` +

                        `❌ **Red Sebebi**\n${redSebebi}\n\n` +

                        `👮 **Reddeden Yetkili**\n${interaction.user}\n\n` +

                        `STATE İsim Değişikliği Sistemi • bugün saat ${saat}`

                    );


            await message.edit({

                embeds: [
                    embed
                ],

                components: []

            });


            try {

                const user =
                    await client.users.fetch(
                        userId
                    );


                await user.send({

                    content:

                        "❌ **İSİM DEĞİŞİKLİĞİN REDDEDİLDİ**\n\n" +

                        `📝 **Talep edilen isim:** ${yeniIsim}\n\n` +

                        `❌ **Red sebebi:** ${redSebebi}\n\n` +

                        `👮 **Reddeden yetkili:** ${interaction.user.username}\n\n` +

                        "Gerekli düzeltmeleri yaptıktan sonra tekrar isim değişikliği talebi oluşturabilirsin."

                });

            } catch {

                console.log(
                    `⚠️ ${userId} kişisine red DM'i gönderilemedi.`
                );
            }


            await interaction.reply({

                content:
                    "❌ İsim değişikliği reddedildi ve personele red sebebiyle birlikte DM gönderildi.",

                ephemeral: true

            });

            return;
        }


        // ==================================================
        // IC İSİM ONAY
        // ==================================================

        if (
            interaction.isButton() &&
            interaction.customId.startsWith(
                "ic_isim_onay_"
            )
        ) {

            if (
                !interaction.member.permissions.has(
                    PermissionFlagsBits.ManageGuild
                )
            ) {

                return interaction.reply({

                    content:
                        "❌ Bu işlemi yapmak için yetkin yok.",

                    ephemeral: true

                });
            }


            const description =
                interaction.message
                    .embeds[0]
                    .description;


            const userMatch =
                description.match(
                    /<@!?(\d+)>/
                );


            const isimMatch =
                description.match(
                    /Yeni İsim\*\*\n`([^`]+)`/
                );


            const kodMatch =
                description.match(
                    /KOD\*\*\n(.+)/
                );


            const adMatch =
                description.match(
                    /Ad Soyad\*\*\n(.+)/
                );


            const departmanMatch =
                description.match(
                    /Departman\*\*\n(.+)/
                );


            if (
                !userMatch ||
                !isimMatch
            ) {

                return interaction.reply({

                    content:
                        "❌ Talep bilgileri okunamadı.",

                    ephemeral: true

                });
            }


            const userId =
                userMatch[1];

            const yeniIsim =
                isimMatch[1];

            const kod =
                kodMatch
                    ? kodMatch[1].trim()
                    : "Bilinmiyor";

            const adSoyad =
                adMatch
                    ? adMatch[1].trim()
                    : "Bilinmiyor";

            const departman =
                departmanMatch
                    ? departmanMatch[1].trim()
                    : "Bilinmiyor";


            let member;

            try {

                member =
                    await interaction.guild.members.fetch(
                        userId
                    );

                await member.setNickname(
                    yeniIsim
                );

            } catch (error) {

                console.error(
                    "❌ Nickname değiştirme hatası:",
                    error
                );

                return interaction.reply({

                    content:

                        "❌ Nickname değiştirilemedi.\n\n" +

                        "Botun rolünün personelin rolünden daha yukarıda olduğundan emin ol.",

                    ephemeral: true

                });
            }


            const tarih =
                new Date();

            const saat =
                tarih.toLocaleTimeString(
                    "tr-TR",
                    {
                        timeZone:
                            "Europe/Istanbul",
                        hour:
                            "2-digit",
                        minute:
                            "2-digit"
                    }
                );


            const embed =
                new EmbedBuilder()
                    .setTitle(
                        "✅ İSİM DEĞİŞİKLİĞİ ONAYLANDI"
                    )
                    .setDescription(

                        `👤 **Talep Eden**\n<@${userId}> \`${userId}\`\n\n` +

                        `📝 **Yeni İsim**\n\`${yeniIsim}\`\n\n` +

                        `🔢 **KOD**\n${kod}\n\n` +

                        `👮 **Ad Soyad**\n${adSoyad}\n\n` +

                        `🏢 **Departman**\n${departman}\n\n` +

                        `👮 **Onaylayan Yetkili**\n${interaction.user}\n\n` +

                        `STATE İsim Değişikliği Sistemi • bugün saat ${saat}`

                    );


            await interaction.message.edit({

                embeds: [
                    embed
                ],

                components: []

            });


            try {

                const user =
                    await client.users.fetch(
                        userId
                    );


                await user.send({

                    content:

                        "✅ **İSİM DEĞİŞİKLİĞİN ONAYLANDI**\n\n" +

                        `📝 **Yeni İsmin:** ${yeniIsim}\n\n` +

                        `👮 **Onaylayan Yetkili:** ${interaction.user.username}\n\n` +

                        "Discord takma adın başarıyla güncellendi."

                });

            } catch {

                console.log(
                    `⚠️ ${userId} kişisine onay DM'i gönderilemedi.`
                );
            }


            await interaction.reply({

                content:
                    `✅ İsim değişikliği onaylandı.\nYeni isim: **${yeniIsim}**`,

                ephemeral: true

            });

            return;
        }


        // ==================================================
        // MESAI BUTONLARI
        // ==================================================

        if (
            !interaction.isButton()
        ) return;


        const userId =
            interaction.user.id;


        if (
            !veriler[userId]
        ) {

            veriler[userId] = {

                toplamMesai: 0,

                aktif: false,

                baslangic: null

            };

            verileriKaydet();
        }


        const personel =
            veriler[userId];


        // ==================================================
        // MESAI BAŞLAT
        // ==================================================

        if (
            interaction.customId ===
            "mesai_baslat"
        ) {

            const voiceId =
                interaction.member.voice.channelId;


            if (
                voiceId !==
                process.env.MESAI_VOICE_CHANNEL_ID
            ) {

                return interaction.reply({

                    content:
                        "❌ Mesai başlatabilmek için 🚔 **Aktif Memur** ses kanalında olmalısın.",

                    ephemeral: true

                });
            }


            if (
                personel.aktif
            ) {

                return interaction.reply({

                    content:
                        "❌ Zaten mesai yapıyorsun.",

                    ephemeral: true

                });
            }


            personel.aktif =
                true;

            personel.baslangic =
                Date.now();

            verileriKaydet();


            return interaction.reply({

                content:
                    "🟢 **Mesainiz başladı, saat kaydedildi.**",

                ephemeral: true

            });
        }


        // ==================================================
        // MESAI BİTİR
        // ==================================================

        if (
            interaction.customId ===
            "mesai_bitir"
        ) {

            if (
                !personel.aktif
            ) {

                return interaction.reply({

                    content:
                        "❌ Şu anda mesai yapmıyorsun.",

                    ephemeral: true

                });
            }


            const gecen =
                Date.now() -
                personel.baslangic;


            personel.toplamMesai +=
                gecen;

            personel.aktif =
                false;

            personel.baslangic =
                null;


            verileriKaydet();


            return interaction.reply({

                content:

                    "🔴 **Mesainiz bitirildi.**\n\n" +

                    `⏱️ Bu mesai: **${sureFormatla(
                        gecen
                    )}**\n` +

                    `📊 Toplam mesai: **${sureFormatla(
                        personel.toplamMesai
                    )}**`,

                ephemeral: true

            });
        }


        // ==================================================
        // MESAİM
        // ==================================================

        if (
            interaction.customId ===
            "mesaim"
        ) {

            const p =
                veriler[userId];


            let aktifSure = 0;


            if (
                p &&
                p.aktif &&
                p.baslangic
            ) {

                aktifSure =
                    Date.now() -
                    p.baslangic;

            }


            const toplam =
                p
                    ? p.toplamMesai +
                      aktifSure
                    : 0;


            return interaction.reply({

                content:

                    "📊 **MESAI BİLGİLERİN**\n\n" +

                    `👮 **Personel:** ${interaction.user.username}\n` +

                    `📌 **Durum:** ${
                        p && p.aktif
                            ? "🟢 Mesai Aktif"
                            : "🔴 Mesai Dışı"
                    }\n` +

                    `⏱️ **Toplam Mesai:** ${sureFormatla(
                        toplam
                    )}`,

                ephemeral: true

            });
        }


        // ==================================================
        // AKTİF PERSONELLER
        // ==================================================

        if (
            interaction.customId ===
            "aktif_personeller"
        ) {

            const aktifler =
                Object.entries(
                    veriler
                )
                .filter(
                    ([id, data]) =>
                        data.aktif &&
                        data.baslangic
                );


            if (
                aktifler.length === 0
            ) {

                return interaction.reply({

                    content:
                        "👮 Şu anda aktif personel bulunmuyor.",

                    ephemeral: true

                });
            }


            let liste = "";


            for (
                const [
                    id,
                    data
                ]
                of aktifler
            ) {

                const sure =
                    Date.now() -
                    data.baslangic;


                liste +=
                    `👮 <@${id}> — **${sureFormatla(
                        sure
                    )}**\n`;
            }


            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "👮 AKTİF PERSONELLER"
                        )

                        .setDescription(
                            liste
                        )

                ],

                ephemeral: true

            });
        }


        // ==================================================
        // MESAI TOP
        // ==================================================

        if (
            interaction.customId ===
            "mesai_top"
        ) {

            const liste =
                Object.entries(
                    veriler
                )
                .map(
                    ([id, data]) => {

                        let sure =
                            data.toplamMesai ||
                            0;


                        if (
                            data.aktif &&
                            data.baslangic
                        ) {

                            sure +=
                                Date.now() -
                                data.baslangic;
                        }


                        return {
                            id,
                            sure
                        };

                    }
                )
                .filter(
                    x =>
                        x.sure > 0
                )
                .sort(
                    (a, b) =>
                        b.sure -
                        a.sure
                )
                .slice(
                    0,
                    20
                );


            if (
                liste.length === 0
            ) {

                return interaction.reply({

                    content:
                        "🏆 Henüz kayıtlı mesai bulunmuyor.",

                    ephemeral: true

                });
            }


            let text = "";


            liste.forEach(
                (item, index) => {

                    const emoji =
                        index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : "👮";


                    text +=

                        `${emoji} **${index + 1}.** <@${item.id}> — **${sureFormatla(
                            item.sure
                        )}**\n`;

                }
            );


            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "🏆 SASP MESAI TOP"
                        )

                        .setDescription(
                            text
                        )

                ],

                ephemeral: true

            });
        }

    }
);


// ======================================================
// BOT LOGIN
// ======================================================

client.login(
    process.env.TOKEN
);
