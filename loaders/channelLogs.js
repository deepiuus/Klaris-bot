const { EmbedBuilder } = require('discord.js');

module.exports = (client, message) => {
    const channelId = '1288436665206968370';
    const channel = client.channels.cache.get(channelId);

    if (channel) {
        const now = new Date();
        const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription(`【${time}】 ${message}`);
        channel.send({ embeds: [embed] });
    } else {
        console.error('Channel not found');
    }
}
