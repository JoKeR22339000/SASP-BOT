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

        .setName("mesai-cikart")

        .setDescription(
            "Bir personeli aktif mesaisinden çıkarır."
        )

        .addUserOption(option =>
            option
                .setName("kişi")
                .setDescription(
                    "Mesaisi sonlandırılacak personel."
                )
                .setRequired(true)
        )

        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser(
                "kişi"
            );

        const veriler =
            verileriYukle();

        if (!veriler[user.id]) {

            return interaction.reply({

                content:
                    "❌ Bu personelin mesai kaydı bulunamadı.",

                ephemeral: true

            });

        }

        const personel =
            veriler[user.id];

        if (!personel.aktif) {

            return interaction.reply({

                content:
                    "❌ Bu personel şu anda aktif mesaide değil.",

                ephemeral: true

            });

        }

        const gecenSure =
            Date.now() -
            personel.baslangic;

        personel.toplamMesai +=
            gecenSure;

        personel.aktif =
            false;

        personel.baslangic =
            null;

        verileriKaydet(veriler);

        await interaction.reply({

            content:

                "🚔 **Personel Mesai'den Çıkarıldı**\n\n" +

                `👮 **Personel:** ${user}\n` +

                `⏱️ **Sonlandırılan mesai:** ${sureFormatla(
                    gecenSure
                )}\n` +

                `📊 **Toplam mesai:** ${sureFormatla(
                    personel.toplamMesai
                )}`

        });

    }

};