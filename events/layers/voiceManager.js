const { setInactivityTimer, clearInactivityTimer } = require('./timerManager');
const alertChannel = "1071202448447901796";

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
