const { readdirSync } = require('fs');

module.exports = (client) => {

    let count = 0;
    const dirEvents = readdirSync('./events/');

    for (const dirs of dirEvents) {
        const filesDirs = readdirSync(`./events/${dirs}/`).filter(file => file.endsWith('.js'));
        for (const files of filesDirs) {
            const event = require(`../events/${dirs}/${files}`);
            client.on(event.name, (...args) => event.run(client, ...args));
            count++;
        };
    };

    console.log(`Loaded ${count} events!`);
}
