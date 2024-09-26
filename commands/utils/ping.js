module.exports = {
    name: "ping",
    description: "latency of the bot",
    async run(client, message) {
        message.reply(`Ping: ${client.ws.ping}ms`);
    }
};
