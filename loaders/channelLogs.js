const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = function(client, message) {
    const channelId = '1288436665206968370';
    const channel = client.channels.cache.get(channelId);

    if (channel) {
        const now = moment().tz('Europe/Paris');
        const time = now.format('HH:mm:ss');
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription(`【${time}】 ${message}`);
        channel.send({ embeds: [embed] }).catch(error => {
            console.error('Failed to send log message to channel:', error);
        });
    } else {
        console.error('Channel not found');
    }
};
