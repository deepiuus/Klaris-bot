const { EmbedBuilder } = require('discord.js');

const alertChannel = "1071202448447901796";

const roles = {
    'discoverer': '1285314461909127168',
    'explorer': '1285315361222168616',
    'survivor': '1286012810974724177',
    'wanderer': '1286012965182636203',
    'master': '1286013145768525824',
    'celestial': '1286013153297170513',
    'krulian': '1286013153762869270',
    'drowned god': '1286013153846624370'
};

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
    'depths':  1 * 60 * 1000,
    'layer 2': 1 * 60 * 1000,
    'layer 3': 1 * 60 * 1000,
    'layer 4': 1 * 60 * 1000,
    'layer 5': 1 * 60 * 1000,
    'layer 6': 1 * 60 * 1000,
    'layer 7': 1 * 60 * 1000,
    'layer 8': 1 * 60 * 1000,
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

function assignRole(member, roleId)
{
    const role = member.guild.roles.cache.get(roleId);
    console.log(`Assigning ${role.name} rank to ${member.user.tag} [${member.id}].`);
    member.roles.add(role).catch(console.error);
}

function alerts(alerter, member, oldLayer, newLayer)
{
    let roleName = '';
    let alertEmbed = new EmbedBuilder().setColor('#0099ff');

    if (oldLayer === 'depths') {
        roleName = 'discoverer';
        alertEmbed
            .setTitle(`${member.user.tag} a découvert un nouvel horizon`)
            .setDescription(`${member.user.tag} a fait ses preuves dans les ${oldLayer}... 
            C'est maintenant un aventurier de puissance 15. Interessant. Je lui autorise donc l'accès à une light hook pour le ${newLayer}, en espérant qu'il ne la consomme pas trop vite...`)
            .setColor('#ff0000'); // Rouge
    } else if (oldLayer === 'layer 2') {
        roleName = 'explorer';
        alertEmbed
            .setTitle(`${member.user.tag} continue d'explorer`)
            .setDescription(`${member.user.tag} est finalement sorti du ${oldLayer} en un temps record... 
            Mais il est désormais dans le ${newLayer} ? À force de creuser il va finir par atteindre le fond !`)
            .setColor('#ff66b2'); // Rose
    } else if (oldLayer === 'layer 3') {
        roleName = 'survivor';
        alertEmbed
            .setTitle(`${member.user.tag} a survécu et progresse`)
            .setDescription(`${member.user.tag} a trouvé comment faire pour rendre plus beau mon texte dans le ${oldLayer}... 
            Il a donc atteint le ${newLayer}.`)
            .setColor('#660066'); // Violet foncé
    } else if (oldLayer === 'layer 4') {
        roleName = 'wanderer';
        alertEmbed
            .setTitle(`${member.user.tag} erre encore dans les profondeurs`)
            .setDescription(`${member.user.tag} a été inactif trop longtemps dans le ${oldLayer}... Il a donc atteint le ${newLayer}.`)
            .setColor('#800000'); // Bordeaux
    } else if (oldLayer === 'layer 5') {
        roleName = 'master';
        alertEmbed
            .setTitle(`${member.user.tag} est maintenant maître de son destin`)
            .setDescription(`${member.user.tag} a été inactif trop longtemps dans le ${oldLayer}... Il a donc atteint le ${newLayer}.`)
            .setColor('#ffd700'); // Doré
    } else if (oldLayer === 'layer 6') {
        roleName = 'celestial';
        alertEmbed
            .setTitle(`${member.user.tag} touche les cieux`)
            .setDescription(`${member.user.tag} a été inactif trop longtemps dans le ${oldLayer}... Il a donc atteint le ${newLayer}.`)
            .setColor('#40e0d0'); // Turquoise
    } else if (oldLayer === 'layer 7') {
        roleName = 'krulian';
        alertEmbed
            .setTitle(`${member.user.tag} est devenu un Krulian`)
            .setDescription(`${member.user.tag} a été inactif trop longtemps dans le ${oldLayer}... Il a donc atteint le ${newLayer}.`)
            .setColor('#ffffff'); // Blanc
    } else if (oldLayer === 'layer 8') {
        roleName = 'drowned god';
        alertEmbed
            .setTitle(`T'es une merde ${member.user.tag}`)
            .setDescription(`${member.user.tag} a probablement que ça à faire de ses journées... Il passera donc le restant de ses jours dans le ${newLayer}.`)
            .setColor('#000000'); // Noir
    }
    if (roleName) {
        const roleId = roles[roleName];
        alertEmbed.setFooter({ text: `${member.user.tag} est désormais un ${roleName}.` });
        alerter.send({ embeds: [alertEmbed] });
        assignRole(member, roleId);
    }
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
