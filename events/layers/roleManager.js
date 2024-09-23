const { EmbedBuilder } = require('discord.js');
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

function assignRole(member, roleName, result, alerter)
{
    let roleId;
    let role;

    if (result.roleName) {
        roleId = roles[roleName];
        role = member.guild.roles.cache.get(roleId);
        console.log(`Assigning ${role.name} rank to ${member.user.tag} [${member.id}].`);
        member.roles.add(role).catch(console.error);
        alerter.send({ embeds: [result.alertEmbed] });
    }
}

function legend(member, oldLayer, newLayer, alertEmbed)
{
    let roleName = "";

    if (oldLayer === 'layer 7') {
        roleName = 'krulian';
        alertEmbed
            .setTitle(`【Son nom est craint de tous】`)
            .setDescription(`${member.user.tag} le terrible, continue son périple après être redescendu du ${oldLayer} pour se risquer au ${newLayer}. Il est temps de se préparer à la venue du nouvel apotre des abysses.`)
            .setColor('#ffffff'); // Blanc
    }
    if (oldLayer === 'layer 8') {
        roleName = 'drowned god';
        alertEmbed
            .setTitle(`【Les profondeurs vous appelent】`)
            .setDescription(`${member.user.tag} a fini sa journée au ${oldLayer}, et ne fait plus qu'un avec les abysses. Il est dés a présent temps pour lui de rejoindre le ${newLayer}, ou il y demeurera pour l'éternité.`)
            .setColor('#000000'); // Noir
    }
    return { roleName, alertEmbed };
}

function veteran(member, oldLayer, newLayer, alertEmbed)
{
    let roleName = "";

    if (oldLayer === 'layer 5') {
        roleName = 'master';
        alertEmbed
            .setTitle(`【La récréation est terminée】`)
            .setDescription(`${member.user.tag} a finalement dépassé le ${oldLayer}, et n'a plus grand chose a prouvé en soit. Mais ne serait il pas deja trop tard pour faire marche arrière ? Le domaine des cieux l'attend au ${newLayer}.`)
            .setColor('#ffd700'); // Doré
    }
    if (oldLayer === 'layer 6') {
        roleName = 'celestial';
        alertEmbed
            .setTitle(`【Le Messie ne viendra pas】`)
            .setDescription(`${member.user.tag} aurait d'après certaines rumeurs surmonté le ${oldLayer}, et atteint le ${newLayer}... Mais je refuse d'y croire, sinon celà voudrait dire que...`)
            .setColor('#40e0d0'); // Turquoise
    }
    return { roleName, alertEmbed };
}

function expert(member, oldLayer, newLayer, alertEmbed)
{
    let roleName = "";

    if (oldLayer === 'layer 3') {
        roleName = 'survivor';
        alertEmbed
            .setTitle(`【Pleeksty serait fier】`)
            .setDescription(`${member.user.tag} est devenu officiellement le plus grand diver qui est foulé le ${oldLayer}, en atteignant sans encombres le ${newLayer}. Continue comme ça !`)
            .setColor('#660066'); // Violet foncé
    }
    if (oldLayer === 'layer 4') {
        roleName = 'wanderer';
        alertEmbed
            .setTitle(`【Retour aux temps obscurs】`)
            .setDescription(`${member.user.tag} a fait sa traversée du désert au ${oldLayer}, et il m'est de plus en plus difficile de le contacter. Il va sans dire que son accession au ${newLayer}, s'inscrira neanmoins dans la légende !`)
            .setColor('#800000'); // Bordeaux
    }
    return { roleName, alertEmbed };
}

function noob(member, oldLayer, newLayer, alertEmbed)
{
    let roleName = "";

    if (oldLayer === 'depths') {
        roleName = 'discoverer';
        alertEmbed
            .setTitle(`【Premier contact】`)
            .setDescription(`${member.user.tag} a fait ses preuves dans les ${oldLayer}... C'est maintenant un aventurier de puissance 15.. Interessant. Je lui autorise donc l'accès à une light hook pour le ${newLayer}, en espérant qu'il ne la consomme pas trop vite...`)
            .setColor('#ff0000'); // Rouge
    }
    if (oldLayer === 'layer 2') {
        roleName = 'explorer';
        alertEmbed
            .setTitle(`【Détermination inébranlable】`)
            .setDescription(`${member.user.tag} est finalement sorti du ${oldLayer} en un temps record... Mais il est désormais dans le ${newLayer} ? À force de creuser il va finir par atteindre le fond !`)
            .setColor('#ff66b2'); // Rose
    }
    return { roleName, alertEmbed };
}

function alerts(alerter, member, oldLayer, newLayer)
{
    let alertEmbed = new EmbedBuilder().setColor('#0099ff');
    let result;

    result = noob(member, oldLayer, newLayer, alertEmbed);
    assignRole(member, result.roleName, result, alerter);
    result = expert(member, oldLayer, newLayer, alertEmbed);
    assignRole(member, result.roleName, result, alerter);
    result = veteran(member, oldLayer, newLayer, alertEmbed);
    assignRole(member, result.roleName, result, alerter);
    result = legend(member, oldLayer, newLayer, alertEmbed);
}

module.exports = { alerts };
