const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'clear',
    description: 'Free current channel',

    async run(client, message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('Si tu refais ça, je te timeout');
        }
        const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
        const botMessages = fetchedMessages.filter(msg => msg.author.id === client.user.id);
        try {
            await message.channel.bulkDelete(botMessages);
        } catch (error) {
            console.error('You cant delete', error);
            message.channel.send('I cant do that --"');
        }
    }
};