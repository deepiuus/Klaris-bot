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
    'Default': 5 * 60 * 1000,
    'layer 2': 10 * 60 * 1000,
    'layer 3': 20 * 60 * 1000,
    'layer 4': 40 * 60 * 1000,
    'layer 5': 80 * 60 * 1000,
    'layer 6': 160 * 60 * 1000,
    'layer 7': 320 * 60 * 1000,
    'layer 8': 640 * 60 * 1000,
    'layer 9': 0 * 60 * 1000
};

function setInactivityTimer(channel) {

    if (Timers.has(channel.id)) {
        console.log(`Timer already set for channel ${channel.name} (${channel.id}), skipping.`);
        return;
    }

    const keys = Object.keys(layers);
    const layerName = keys.find(key => layers[key] === channel.id) || 'Default';
    const currentIndex = keys.indexOf(layerName);

    if (currentIndex === keys.length - 1) {
        console.log(`No timer set for the last layer: ${layerName} (${channel.id})`);
        return;
    }

    console.log(`Setting inactivity timer for channel ${channel.name} (${channel.id})`);
    const nextLayer = keys[currentIndex + 1];
    const nextLayerId = layers[nextLayer];
    const time = Time[layerName];
    let remainingTime = time;
    const countdownInterval = setInterval(() => {
        remainingTime -= 5000;
        console.log(`Time remaining for channel ${channel.name}: ${remainingTime / 1000} seconds`);
        if (remainingTime <= 0)
            clearInterval(countdownInterval);
    }, 5000);

    const timer = setTimeout(() => {
        console.log(`Inactivity timer triggered for channel ${channel.name} (${channel.id})`);
        if (channel.type === '2') {
            console.log(`ce channel est génant`);
        } else {
            channel.members.forEach(member => {
                console.log(`Disconnecting member ${member.user.tag} from channel ${channel.name}`);
                if (member.voice.channel)
                    member.voice.setChannel(nextLayerId).catch(console.error);
                else
                    console.log(`${member.user.tag} est génant`);
            });
        }
    }, time);

    Timers.set(channel.id, { timer, countdownInterval });
}

function clearInactivityTimer(channel) {

    if (!channel) {
        console.log('Channel is null, skipping clearInactivityTimer.');
        return;
    }
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
        if (oldState.channelId === null && newState.channelId !== null) {
            console.log(`${newState.member.user.tag} joined channel ${newState.channelId}.`);
            if (newState.selfMute)
                setInactivityTimer(newState.channel);
        } else if (oldState.channelId !== null && newState.channelId === null) {
            console.log(`${oldState.member.user.tag} left channel ${oldState.channelId}.`);
            clearInactivityTimer(oldState.channel);
        } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId) {
            console.log(`${oldState.member.user.tag} switched channels from ${oldState.channelId} to ${newState.channelId}.`);
            clearInactivityTimer(oldState.channel);
            if (newState.selfMute)
                setInactivityTimer(newState.channel);
        }
        if (!oldState.selfMute && newState.selfMute) {
            console.log(`${newState.member.user.tag} muted their microphone in channel ${newState.channelId}. Setting timer.`);
            setInactivityTimer(newState.channel);
        }
        if (oldState.selfMute && !newState.selfMute) {
            console.log(`${newState.member.user.tag} unmuted their microphone in channel ${newState.channelId}. Resetting timer.`);
            clearInactivityTimer(newState.channel);
        }
    });
};
