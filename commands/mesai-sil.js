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
        .setName("mesai-sil")
        .setDescription("Bir personelin mesaisinden süre siler.")

        .addUserOption(option =>
            option
                .setName("kişi")
                .setDescription("Mesaisi silinecek personel.")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("dakika")
                .setDescription("Silinecek dakika.")
                .setMinValue(1)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("sebep")
                .setDescription("Mesai silme sebebi.")
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

                return interaction.reply({

                    content:
                        "❌ Bu personelin kayıtlı mesaisi bulunmuyor.",

                    ephemeral: true

                });

            }


            const silinecek =
                dakika * 60 * 1000;


            veriler[user.id].toplamMesai =
                Math.max(
                    0,
                    veriler[user.id].toplamMesai -
                    silinecek
                );


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
                    `✅ ${user} adlı personelden **${dakika} dakika** mesai silindi.`,

                ephemeral: true

            });


            // Seçilen personele DM
            user.send({

                content:

                    "➖ **MESAI SİLİNDİ**\n\n" +

                    `👮 **Personel:** ${user.username}\n` +

                    `⏱️ **Silinen:** ${dakika} dakika\n` +

                    `📝 **Sebep:** ${sebep}\n\n` +

                    `📊 **Yeni toplam mesain:** ${sureFormatla(
                        yeniToplam
                    )}`

            }).catch(() => {});


        } catch (error) {

            console.error(
                "❌ MESAI SIL HATASI:",
                error
            );

            if (!interaction.replied) {

                await interaction.reply({
                    content:
                        "❌ Mesai silinirken hata oluştu.",
                    ephemeral: true
                });

            }

        }

    }

};