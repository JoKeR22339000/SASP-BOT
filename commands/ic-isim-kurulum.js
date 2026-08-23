const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("ic-isim-kurulum")
        .setDescription("IC isim değişikliği panelini oluşturur.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {

        const tarih = new Date();

        const saat = tarih.toLocaleTimeString("tr-TR", {
            timeZone: "Europe/Istanbul",
            hour: "2-digit",
            minute: "2-digit"
        });

        const embed = new EmbedBuilder()
            .setTitle("PERSONEL İSİM DEĞİŞİKLİĞİ")
            .setDescription(
                "Discord takma adını değiştirmek için aşağıdaki butona bas.\n\n" +
                "**İsim Formatı Örnek:**\n" +
                "`02 - Ithan Armando | SASP`\n\n" +
                "İsim değişikliği yetkili onayından sonra uygulanır."
            )
            .addFields({
                name: "🏛️ State Yönetim Sistemi",
                value: `Bugün saat **${saat}**`
            })
            .setFooter({
                text: "STATE İsim Değişikliği Sistemi"
            })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ic_isim_degistir")
                    .setLabel("İsim Değiştir")
                    .setEmoji("📝")
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({
            content: "✅ IC isim değişikliği paneli oluşturuldu.",
            ephemeral: true
        });
    }
};