const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    verileriYukle,
    verileriKaydet
} = require("../utils/mesai");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("mesai-toplu-sil")

        .setDescription(
            "Tüm personellerin mesaisinden süre siler."
        )

        .addIntegerOption(option =>
            option
                .setName("dakika")
                .setDescription(
                    "Her personelden silinecek dakika."
                )
                .setMinValue(1)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName("sebep")
                .setDescription(
                    "Toplu silme sebebi."
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const dakika =
            interaction.options.getInteger(
                "dakika"
            );

        const sebep =
            interaction.options.getString(
                "sebep"
            );

        const veriler =
            verileriYukle();

        const silinecek =
            dakika * 60 * 1000;

        let etkilenen =
            0;

        for (
            const userId in veriler
        ) {

            if (
                typeof veriler[userId]
                    .toplamMesai !==
                "number"
            ) {
                continue;
            }

            veriler[userId].toplamMesai =
                Math.max(
                    0,
                    veriler[userId]
                        .toplamMesai -
                    silinecek
                );

            etkilenen++;

        }

        verileriKaydet(veriler);

        await interaction.reply({

            content:

                "🗑️ **Toplu Mesai Silme İşlemi**\n\n" +

                `⏱️ **Silinen:** ${dakika} dakika\n` +

                `👮 **Etkilenen personel:** ${etkilenen}\n` +

                `📝 **Sebep:** ${sebep}`

        });

    }

};