const Guild = require('./src/database/models/GuildSettings.js');
const WelcomeDB = require('./src/database/models/welcome.js');
const { MessageEmbed } = require("discord.js");
const moment = require('moment');

module.exports = async (member) => {
    try {
        let guildDB = await Guild.findOne({
            guildId: member.guild.id
        });

        let welcome = await WelcomeDB.findOne({
            guildId: member.guild.id
        });

        if (!welcome) {
            const newSettings = new WelcomeDB({
                guildId: member.guild.id
            });
            await newSettings.save().catch(() => {});
            welcome = await WelcomeDB.findOne({ guildId: member.guild.id });
        }

        if (welcome.welcomeToggle == "true") {
            if (welcome.welcomeDM == "true") {
                let text = welcome.welcomeMessage.replace(/{user}/g, `${member}`)
                    .replace(/{user_tag}/g, `${member.user.tag}`)
                    .replace(/{user_name}/g, `${member.user.username}`)
                    .replace(/{user_ID}/g, `${member.id}`)
                    .replace(/{guild_name}/g, `${member.guild.name}`)
                    .replace(/{guild_ID}/g, `${member.guild.id}`)
                    .replace(/{memberCount}/g, `${member.guild.memberCount}`)
                    .replace(/{size}/g, `${member.guild.memberCount}`)
                    .replace(/{guild}/g, `${member.guild.name}`)
                    .replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
                    .replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);

                if (welcome.welcomeEmbed == "false") {
                    member.send(`${text}`).catch(() => {});
                }
                if (welcome.welcomeEmbed == "true") {
                    let embed = new MessageEmbed();

                    let color = welcome.embed.color;
                    if (color) embed.setColor(color);

                    let title = welcome.embed.title;
                    if (title !== null) embed.setTitle(title);

                    let titleUrl = welcome.embed.titleURL;
                    if (titleUrl !== null) embed.setURL(titleUrl);

                    let textEmbed = welcome.embed.description.replace(/{user}/g, `${member}`)
                        .replace(/{user_tag}/g, `${member.user.tag}`)
                        .replace(/{user_name}/g, `${member.user.username}`)
                        .replace(/{user_ID}/g, `${member.id}`)
                        .replace(/{guild_name}/g, `${member.guild.name}`)
                        .replace(/{guild_ID}/g, `${member.guild.id}`)
                        .replace(/{memberCount}/g, `${member.guild.memberCount}`)
                        .replace(/{size}/g, `${member.guild.memberCount}`)
                        .replace(/{guild}/g, `${member.guild.name}`)
                        .replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
                        .replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);

                    if (textEmbed !== null) embed.setDescription(textEmbed);

                    let authorName = welcome.embed.author.name.replace(/{user_tag}/g, `${member.user.tag}`)
                        .replace(/{user_name}/g, `${member.user.username}`)
                        .replace(/{user_ID}/g, `${member.id}`)
                        .replace(/{guild_name}/g, `${member.guild.name}`)
                        .replace(/{guild_ID}/g, `${member.guild.id}`)
                        .replace(/{memberCount}/g, `${member.guild.memberCount}`)
                        .replace(/{size}/g, `${member.guild.memberCount}`)
                        .replace(/{guild}/g, `${member.guild.name}`);

                    if (authorName !== null) embed.setAuthor(authorName);

                    let authorIcon = welcome.embed.author.icon;
                    if (authorIcon !== null) embed.setAuthor(authorName, authorIcon);
          
                    let authorUrl = welcome.embed.author.url;
                    if (authorUrl !== null) embed.setAuthor(authorName, authorIcon, authorUrl);
          
                    let footer = welcome.embed.footer;
                    if (footer !== null) embed.setFooter(footer);
          
                    let footerIcon = welcome.embed.footerIcon;
                    if (footer && footerIcon !== null) embed.setFooter(footer, footerIcon);
          
                    let timestamp = welcome.embed.timestamp;
                    if (timestamp == "true") embed.setTimestamp();
          
                    let thumbnail = welcome.embed.thumbnail;
                    if (thumbnail === "{userAvatar}") thumbnail = member.user.displayAvatarURL({ dynamic: true, size: 512 });
                    if (thumbnail !== null) embed.setThumbnail(thumbnail);
          
                    let image = welcome.embed.image;
                    if (image === "{userAvatar}") image = member.user.displayAvatarURL({ dynamic: true, size: 512 });
                    if (image !== null) embed.setImage(image);
          
                    member.send({ embeds: [embed] }).catch(() => {});
                  }
                }
                    member.send({ embeds: [embed] }).catch(() => {});
                
          

            if (welcome.welcomeDM == "false") {
                if (welcome.welcomeChannel) {
                    const greetChannel = member.guild.channels.cache.get(welcome.welcomeChannel);
                    if (greetChannel) {
                        let text = welcome.welcomeMessage.replace(/{user}/g, `${member}`)
                            .replace(/{user_tag}/g, `${member.user.tag}`)
                            .replace(/{user_name}/g, `${member.user.username}`)
                            .replace(/{user_ID}/g, `${member.id}`)
                            .replace(/{guild_name}/g, `${member.guild.name}`)
                            .replace(/{guild_ID}/g, `${member.guild.id}`)
                            .replace(/{memberCount}/g, `${member.guild.memberCount}`)
                            .replace(/{size}/g, `${member.guild.memberCount}`)
                            .replace(/{guild}/g, `${member.guild.name}`)
                            .replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
                            .replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);

                        if (welcome.welcomeEmbed == "false") {
                            if (greetChannel &&
                                greetChannel.viewable &&
                                greetChannel.permissionsFor(member.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
                                greetChannel.send(`${text}`).catch(() => {});
                            }
                        }

                        if (welcome.welcomeEmbed == "true") {
                            let embed = new MessageEmbed();

                            let color = welcome.embed.color;
                            if (color) embed.setColor(color);

                            let title = welcome.embed.title;
                            if (title !== null) embed.setTitle(title);

                            let titleUrl = welcome.embed.titleURL;
                            if (titleUrl !== null) embed.setURL(titleUrl);

                            let textEmbed = welcome.embed.description.replace(/{user}/g, `${member}`)
                                .replace(/{user_tag}/g, `${member.user.tag}`)
                                .replace(/{user_name}/g, `${member.user.username}`)
                                .replace(/{user_ID}/g, `${member.id}`)
                                .replace(/{guild_name}/g, `${member.guild.name}`)
                                .replace(/{guild_ID}/g, `${member.guild.id}`)
                                .replace(/{memberCount}/g, `${member.guild.memberCount}`)
                                .replace(/{size}/g, `${member.guild.memberCount}`)
                                .replace(/{guild}/g, `${member.guild.name}`)
                                .replace(/{member_createdAtAgo}/g, `${moment(member.user.createdTimestamp).fromNow()}`)
                                .replace(/{member_createdAt}/g, `${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`);

                            if (textEmbed !== null) embed.setDescription(textEmbed);

                            let authorName = welcome.embed.author.name.replace(/{user_tag}/g, `${member.user.tag}`)
                                .replace(/{user_name}/g, `${member.user.username}`)
                                .replace(/{user_ID}/g, `${member.id}`)
                                .replace(/{guild_name}/g, `${member.guild.name}`)
                                .replace(/{guild_ID}/g, `${member.guild.id}`)
                                .replace(/{memberCount}/g, `${member.guild.memberCount}`)
                                .replace(/{size}/g, `${member.guild.memberCount}`)
                                .replace(/{guild}/g, `${member.guild.name}`);

                            if (authorName !== null) embed.setAuthor(authorName);

                            // ... (rest of your embed setup)

                            if (greetChannel &&
                                greetChannel.viewable &&
                                greetChannel.permissionsFor(member.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
                                greetChannel.send({ embeds: [embed] }).catch(() => {});
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error in guildMemberAdd event: ${error}`);
    }
};
