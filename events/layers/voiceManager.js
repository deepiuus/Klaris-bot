const { Collection } = require('discord.js');

const Timers = new Collection();

const layers = {
    'Default': '1028732111215153182',
    'layer 2': '1057651790683832401',
    'layer 3': '1282024736540459121',
    'layer 4': '1282024752348921938',
    'layer 5': '1282024765506453586',
    'layer 6': '1282024780173807689',
    'layer 7': '1282024791922053171',
    'layer 8': '1282024956045168691',
    'layer 9': '1282024969790034063'
};

const Time = {
    'Default': 1 * 60 * 1000,
    'layer 2': 2 * 60 * 1000,
    'layer 3': 3 * 60 * 1000,
    'layer 4': 4 * 60 * 1000,
    'layer 5': 5 * 60 * 1000,
    'layer 6': 6 * 60 * 1000,
    'layer 7': 7 * 60 * 1000,
    'layer 8': 8 * 60 * 1000,
    'layer 9': 9 * 60 * 1000
};

function setInactivityTimer(channel) {

    console.log(`Setting inactivity timer for channel ${channel.name} (${channel.id})`);
    const layerName = Object.keys(layers).find(key => layers[key] === channel.id) || 'Default';
    const time = Time[layerName];
    let remainingTime = time;
    const countdownInterval = setInterval(() => {
        remainingTime -= 1000;
        console.log(`Time remaining for channel ${channel.name}: ${remainingTime / 1000} seconds`);
        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);

    const timer = setTimeout(() => {
        console.log(`Inactivity timer triggered for channel ${channel.name} (${channel.id})`);
        console.log(`Channel type: ${channel.type}`);
        if (channel.type === '2') {
            return;
        } else {
            channel.members.forEach(member => {
                console.log(`Disconnecting member ${member.user.tag} from channel ${channel.name}`);
                member.voice.disconnect().catch(console.error);
            });
        }
    }, time);

    Timers.set(channel.id, { timer, countdownInterval });
}

function clearInactivityTimer(channel) {

    console.log(`Clearing inactivity timer for channel ${channel.name} (${channel.id})`);
    const timerObj = Timers.get(channel.id);
    if (timerObj) {
        clearTimeout(timerObj.timer);
        clearInterval(timerObj.countdownInterval);
        Timers.delete(channel.id);
    }
}

module.exports = (client) => {

    client.on('voiceStateUpdate', (oldState, newState) => {
        console.log("--------------------");
        console.log(oldState.channel);
        console.log("--------------------");
        console.log(newState.channel);
        console.log("--------------------");
        if (oldState.channelId === null && newState.channelId !== null) {
            console.log(`${newState.member.user.tag} joined channel ${newState.channelId}.`);
            setInactivityTimer(newState.channel);
        } else if (oldState.channelId !== null && newState.channelId === null) {
            console.log(`${oldState.member.user.tag} left channel ${oldState.channelId}.`);
            clearInactivityTimer(oldState.channel);
        } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId) {
            console.log(`${oldState.member.user.tag} switched channels from ${oldState.channelId} to ${newState.channelId}.`);
            clearInactivityTimer(oldState.channel);
            setInactivityTimer(newState.channel);
        }
    });
};