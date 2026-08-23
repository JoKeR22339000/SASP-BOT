const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    verileriYukle,
    verileriKaydet,
    sureFormatla
} = require("../utils/mesai");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("mesai-ekle")
        .setDescription("Bir personele mesai ekler.")

        .addUserOption(option =>
            option
                .setName("kişi")
                .setDescription("Mesai eklenecek personel.")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("dakika")
                .setDescription("Eklenecek dakika.")
                .setMinValue(1)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("sebep")
                .setDescription("Mesai ekleme sebebi.")
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        try {

            const user =
                interaction.options.getUser("kişi");

            const dakika =
                interaction.options.getInteger("dakika");

            const sebep =
                interaction.options.getString("sebep");


            const veriler =
                verileriYukle();


            if (!veriler[user.id]) {

                veriler[user.id] = {
                    toplamMesai: 0,
                    aktif: false,
                    baslangic: null
                };

            }


            const eklenecek =
                dakika * 60 * 1000;


            veriler[user.id].toplamMesai +=
                eklenecek;


            const kaydedildi =
                verileriKaydet(veriler);


            if (!kaydedildi) {

                return interaction.reply({
                    content:
                        "❌ Mesai kaydedilemedi.",
                    ephemeral: true
                });

            }


            const yeniToplam =
                veriler[user.id].toplamMesai;


            // Komuta hemen cevap
            await interaction.reply({

                content:
                    `✅ ${user} adlı personele **${dakika} dakika** mesai eklendi.`,

                ephemeral: true

            });


            // Seçilen personele DM
            user.send({

                content:

                    "➕ **MESAI EKLENDİ**\n\n" +

                    `👮 **Personel:** ${user.username}\n` +

                    `⏱️ **Eklenen:** ${dakika} dakika\n` +

                    `📝 **Sebep:** ${sebep}\n\n` +

                    `📊 **Yeni toplam mesain:** ${sureFormatla(
                        yeniToplam
                    )}`

            }).catch(() => {});


        } catch (error) {

            console.error(
                "❌ MESAI EKLE HATASI:",
                error
            );

            if (!interaction.replied) {

                await interaction.reply({
                    content:
                        "❌ Mesai eklenirken hata oluştu.",
                    ephemeral: true
                });

            }

        }

    }

};