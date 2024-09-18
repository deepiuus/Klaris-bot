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

function setInactivityTimer(client, member) {

    if (client.timers.has(member.id)) {
        const timerObj = client.timers.get(member.id);
        if (timerObj) {
            const remainingTime = timerObj.remainingTime;
            console.log(`Because ${member.user.tag} [${member.id}] is already afk :`);
            console.log(`Time remaining for ${member.user.tag} [${member.id}] in ${member.voice.channel.name} [${member.voice.channel.id}]: ${remainingTime / 1000} second(s).`);
        }
        return;
    }
    const channel = member.voice.channel;
    if (!channel) {
        console.log(`${member.user.tag} is not in a voice channel.`);
        return;
    }
    const keys = Object.keys(layers);
    const layerName = keys.find(key => layers[key] === channel.id) || 'Default';
    const currentIndex = keys.indexOf(layerName);
    if (currentIndex === keys.length - 1) {
        console.log(`No timer set for the last layer: ${layerName} [${channel.id}].`);
        return;
    }
    console.log(`Setting inactivity timer for ${member.user.tag} [${member.id}] in ${channel.name} [${channel.id}].`);
    const nextLayer = keys[currentIndex + 1];
    const nextLayerId = layers[nextLayer];
    const time = Time[layerName];
    let remainingTime = time;
    console.log(`Time remaining for ${member.user.tag} [${member.id}] in ${channel.name} [${channel.id}]: ${remainingTime / 1000} second(s). (15s logs cooldown)`);

    const countdownInterval = setInterval(() => {
        remainingTime -= 15000;
        console.log(`Time remaining for ${member.user.tag} [${member.id}]: ${remainingTime / 1000} second(s).`);
        if (remainingTime <= 0)
            clearInterval(countdownInterval);
        client.timers.set(member.id, { timer, countdownInterval, remainingTime });
    }, 15000);

    const timer = setTimeout(() => {
        console.log(`Inactivity timer triggered for ${member.user.tag} [${member.id}] in ${channel.name} [${channel.id}].`);
        if (member.voice.channel)
            member.voice.setChannel(nextLayerId).catch(console.error);
        else
            console.log(`${member.user.tag} is not in a voice channel.`);
    }, time);

    client.timers.set(member.id, { timer, countdownInterval, remainingTime });
}

function clearInactivityTimer(client, member, previousChannel) {

    if (!member) {
        console.log('Skipping clearInactivityTimer.');
        return;
    }
    const timerObj = client.timers.get(member.id);
    if (timerObj) {
        console.log(`Clearing inactivity timer for ${member.user.tag} [${member.id}] in ${previousChannel.name} [${previousChannel.id}].`);
        clearTimeout(timerObj.timer);
        clearInterval(timerObj.countdownInterval);
        client.timers.delete(member.id);
    }
}

module.exports = {
    name: 'voiceStateUpdate',
    run: (client, oldState, newState) => {
        if (oldState.channelId === null && newState.channelId !== null) {
            console.log(`${newState.member.user.tag} [${newState.member.id}] joined ${newState.channel.name} [${newState.channel.id}].`);
            if (newState.selfMute) {
                setInactivityTimer(client, newState.member);
            }
        } else if (oldState.channelId !== null && newState.channelId === null) {
            console.log(`${oldState.member.user.tag} [${oldState.member.id}] left ${oldState.channel.name} [${oldState.channel.id}].`);
            clearInactivityTimer(client, oldState.member, oldState.channel);
        } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId) {
            console.log(`${oldState.member.user.tag} [${oldState.member.id}] switched from ${oldState.channel.name} [${oldState.channel.id}] to ${newState.channel.name} [${newState.channel.id}].`);
            clearInactivityTimer(client, oldState.member, oldState.channel);
            if (newState.selfMute) {
                setInactivityTimer(client, newState.member);
            }
        }
        if (!oldState.selfMute && newState.selfMute) {
            console.log(`${newState.member.user.tag} [${newState.member.id}] is afk in ${newState.channel.name} [${newState.channel.id}].`);
            setInactivityTimer(client, newState.member);
        }
        if (oldState.selfMute && !newState.selfMute) {
            console.log(`${newState.member.user.tag} [${newState.member.id}] is no longer afk in ${newState.channel.name} [${newState.channel.id}].`);
            clearInactivityTimer(client, newState.member, newState.channel);
        }
    }
};
