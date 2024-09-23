const { alerts } = require('./roleManager');
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

function additionalTimer(memberTag, memberId, timerObj, channel, keys, oldLayer, oldId)
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

function initCountdown(client, member, timeLeft, timer)
{
    const countdown = setInterval(() => {
        timeLeft -= 15000;
        console.log(`Time remaining for ${member.user.tag} [${member.id}]: ${timeLeft / 1000} second(s).`);
        if (timeLeft <= 0)
            clearInterval(countdown);
        client.timers.set(member.id, { timer, countdown, timeLeft });
    }, 15000);
    return countdown;
}

function triggeredTimer(alerter, member, channel, oldLayer, newLayer, newId, time)
{
    const timer = setTimeout(() => {
        console.log(`Inactivity timer triggered for ${member.user.tag} [${member.id}] in ${channel.name} [${channel.id}].`);
        alerts(alerter, member, oldLayer, newLayer);
        if (member.voice.channel)
            member.voice.setChannel(newId).catch(console.error);
        else
            console.log(`${member.user.tag} is not in a voice channel.`);
    }, time);
    return timer;
}

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

function setInactivityTimer(alerter, client, member)
{
    let timer;
    let countdown;
    const vars = initVar(client, member);
    let { memberId, memberTag, channel, keys, timerObj, oldLayer, oldId,
    newLayer, newId, time, timeLeft } = vars;

    if (additionalTimer(memberTag, memberId, timerObj, channel, keys, oldLayer, oldId))
        return;
    console.log(`Setting inactivity timer for ${memberTag} [${memberId}] in ${channel.name} [${channel.id}].`);
    timer = triggeredTimer(alerter, member, channel, oldLayer, newLayer, newId, time);
    countdown = initCountdown(client, member, timeLeft, timer);
    client.timers.set(member.id, { timer, countdown, timeLeft });
    console.log(`Time remaining for ${member.user.tag} [${member.id}]: ${timeLeft / 1000} second(s). (15s logs cooldown)`);
}

function clearInactivityTimer(client, member, previousChannel)
{
    const timerObj = client.timers.get(member.id);

    if (timerObj) {
        console.log(`Clearing inactivity timer for ${member.user.tag} [${member.id}] in ${previousChannel.name} [${previousChannel.id}].`);
        clearTimeout(timerObj.timer);
        clearInterval(timerObj.countdown);
        client.timers.delete(member.id);
    }
}

module.exports = {clearInactivityTimer, setInactivityTimer};
