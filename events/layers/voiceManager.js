const alertChannel = "1071202448447901796";

const layers = {
    'depths': '1028732111215153182',
    'layer 2': '1057651790683832401',
    'layer 3': '1282024736540459121',
    'layer 4': '1282024752348921938',
    'layer 5': '1282024765506453586',
    'layer 6': '1282024780173807689',
    'layer 7': '1282024791922053171',
    'layer 8': '1282024956045168691',
    'layer 9': '1282024969790034063'
};

const timers = {
    'depths':  5 * 60 * 1000,
    'layer 2': 10 * 60 * 1000,
    'layer 3': 20 * 60 * 1000,
    'layer 4': 40 * 60 * 1000,
    'layer 5': 80 * 60 * 1000,
    'layer 6': 160 * 60 * 1000,
    'layer 7': 320 * 60 * 1000,
    'layer 8': 640 * 60 * 1000,
    'layer 9': 0 * 60 * 1000
};

function initVar(client, member)
{
    const memberId = member.id;
    const memberTag = member.user.tag;
    const channel = member.voice.channel;
    const keys = Object.keys(layers);
    const timerObj = client.timers.get(memberId);
    const oldLayer = keys.find(key => layers[key] === channel?.id);
    const oldId = keys.indexOf(oldLayer);
    const newLayer = keys[oldId + 1];
    const newId = layers[newLayer];
    const time = timers[oldLayer];
    let timeLeft = time;
    return { memberId, memberTag, channel, keys, timerObj,
    oldLayer, oldId, newLayer, newId, time, timeLeft };
}

function alerts(alerter, member, oldLayer, newLayer)
{
    if (oldLayer === 'depths')
        alerter.send(`${member.user.tag} a fait ses preuves dans les ${oldLayer}... C'est maintenant un aventurier de puissance 15.. Interessant. Je lui autorise donc l'accès à une light hook pour le ${newLayer}, en espérant qu'il ne la consomme pas trop vite...`);
    else if (oldLayer === 'layer 2')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}. A force de creuser il va finir par atteindre le fond !`);
    else if (oldLayer === 'layer 3')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}. A force de creuser il va finir par atteindre le fond !`);
    else if (oldLayer === 'layer 4')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}.`);
    else if (oldLayer === 'layer 5')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}.`);
    else if (oldLayer === 'layer 6')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}.`);
    else if (oldLayer === 'layer 7')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}.`);
    else if (oldLayer === 'layer 8')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}.`);
    else if (oldLayer === 'layer 9')
        alerter.send(`${member.user.tag} a était trop longtemps inactif dans le(s) ${oldLayer}... Il a donc atteint le ${newLayer}.`);
}

function noAdditionalTimer(memberTag, memberId, timerObj, channel, keys, oldLayer, oldId)
{
    if (timerObj) {
        timeLeft = timerObj.timeLeft;
        console.log(`Because ${memberTag} [${memberId}] is already afk :`);
        console.log(`Time remaining for ${memberTag} [${memberId}]: ${timeLeft / 1000} second(s).`);
        return true;
    }
    if (oldId === keys.length - 1) {
        console.log(`No timer set for the last layer: ${oldLayer} [${channel.id}].`);
        return true;
    }
    return false;
}

function setInactivityTimer(alerter, client, member)
{
    const vars = initVar(client, member);
    let { memberId, memberTag, channel, keys, timerObj, oldLayer, oldId,
    newLayer, newId, time, timeLeft } = vars;

    if (noAdditionalTimer(memberTag, memberId, timerObj, channel, keys, oldLayer, oldId)) return;
    console.log(`Setting inactivity timer for ${memberTag} [${memberId}] in ${channel.name} [${channel.id}].`);
    const countdownInterval = setInterval(() => {
        timeLeft -= 15000;
        console.log(`Time remaining for ${member.user.tag} [${member.id}]: ${timeLeft / 1000} second(s).`);
        if (timeLeft <= 0)
            clearInterval(countdownInterval);
        client.timers.set(member.id, { timer, countdownInterval, timeLeft });
    }, 15000);

    const timer = setTimeout(() => {
        console.log(`Inactivity timer triggered for ${member.user.tag} [${member.id}] in ${channel.name} [${channel.id}].`);
        alerts(alerter, member, oldLayer, newLayer);
        if (member.voice.channel)
            member.voice.setChannel(newId).catch(console.error);
        else
            console.log(`${member.user.tag} is not in a voice channel.`);
    }, time);

    client.timers.set(member.id, { timer, countdownInterval, timeLeft });
    console.log(`Time remaining for ${member.user.tag} [${member.id}]: ${timeLeft / 1000} second(s). (15s logs cooldown)`);
}

function clearInactivityTimer(client, member, previousChannel)
{
    const timerObj = client.timers.get(member.id);

    if (timerObj) {
        console.log(`Clearing inactivity timer for ${member.user.tag} [${member.id}] in ${previousChannel.name} [${previousChannel.id}].`);
        clearTimeout(timerObj.timer);
        clearInterval(timerObj.countdownInterval);
        client.timers.delete(member.id);
    }
}

function afkCheck(client, alerter, oldState, newState)
{
    if (!oldState.selfMute && newState.selfMute) {
        console.log(`${newState.member.user.tag} [${newState.member.id}] is afk in ${newState.channel.name} [${newState.channel.id}].`);
        setInactivityTimer(alerter, client, newState.member);
    }
    if (oldState.selfMute && !newState.selfMute) {
        console.log(`${newState.member.user.tag} [${newState.member.id}] is no longer afk in ${newState.channel.name} [${newState.channel.id}].`);
        clearInactivityTimer(client, newState.member, newState.channel);
    }
}

function voiceStateUpdate(client, oldState, newState)
{
    const alerter = client.channels.cache.get(alertChannel);

    if (oldState.channelId === null && newState.channelId !== null) {
        console.log(`${newState.member.user.tag} [${newState.member.id}] joined ${newState.channel.name} [${newState.channel.id}].`);
        if (newState.selfMute)
            setInactivityTimer(alerter, client, newState.member);
    } else if (oldState.channelId !== null && newState.channelId === null) {
        console.log(`${oldState.member.user.tag} [${oldState.member.id}] left ${oldState.channel.name} [${oldState.channel.id}].`);
        clearInactivityTimer(client, oldState.member, oldState.channel);
    } else if (oldState.channelId !== null && newState.channelId !== null && oldState.channelId !== newState.channelId) {
        console.log(`${oldState.member.user.tag} [${oldState.member.id}] switched from ${oldState.channel.name} [${oldState.channel.id}] to ${newState.channel.name} [${newState.channel.id}].`);
        clearInactivityTimer(client, oldState.member, oldState.channel);
        if (newState.selfMute)
            setInactivityTimer(alerter, client, newState.member);
    }
    afkCheck(client, alerter, oldState, newState);
}

module.exports = {
    name: 'voiceStateUpdate',
    run: voiceStateUpdate
};
