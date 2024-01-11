const Discord = require("discord.js");
const { Client, Collection, MessageEmbed } = require("discord.js");

const client = (global.Client = new Client())
const config = require("./config.js");
global.config = config;
client.queue = new Collection();  // هذا هو المفتاح
client.gameMembers = new Map();
client.waitingResponse = new Set();
client.musicGuilds = new Map();
client.soundboardGuilds = new Map();
client.databaseCache = client.databaseCache || {};
client.databaseCache.soundEffects = new Collection();
const fs = require("fs");
const fetch = require("node-fetch");
client.htmll = require('cheerio');

require('events').EventEmitter.prototype._maxListeners = 100;
client.komutlar = new Discord.Collection();
client.aliases = new Discord.Collection();

// Load commands from folders
const commandFolders = fs.readdirSync('./src/commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const props = require(`./src/commands/${folder}/${file}`);
        if (!props.help) continue;

        client.komutlar.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
            global.commands = file;
        });
    }
}
client.on('guildMemberAdd', async (member) => {
    const data = require("./src/database/models/GuildSettings.js");
    const db = await data.findOne({ guildId: member.guild.id });

    for (const [guildId, guild] of client.guilds.cache) {
        const role = guild.roles.cache.find(r => r.id === db.autoroleID);

        if (role) {
            member.roles.add(role).catch((err) => {
                console.error(`Error adding role to member: ${err}`);
            });
        }
    }
});
const GuildSettings = require('./src/database/models/GuildSettings.js'); // Adjust the path as needed
const UserSettings = require('./src/database/models/GuildSettings.js');

client.on('message', async (message) => {
    try {
        // Fetch the guild settings including the prefix
        const guildDB = await GuildSettings.findOne({
            guildId: message.guild.id
        });

        // Use the fetched prefix or default to a specific prefix
        const guildPrefix = guildDB ? guildDB.prefix : '.';

        // Get the user's settings from the database
        const userSettings = await UserSettings.findOne({ guildId: message.guild.id, userId: message.author.id });

        // Use the user's prefix from the settings or default to the guild prefix
        const userPrefix = userSettings ? userSettings.prefix : guildPrefix;

        // Check if the message starts with the user's prefix
        if (message.content.startsWith(userPrefix)) {
            // Extract command and parameters
            const args = message.content.slice(userPrefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Check if the command exists
            if (client.komutlar.has(commandName)) {
                const command = client.komutlar.get(commandName);
                // Execute the command
                command.run(client, message, args);
            }
        }
    } catch (error) {
        console.error('Error handling message:', error);
        // Handle the error (e.g., send a message to the user)
    }
});
client.on('ready', async () => {
    console.log("(!) Bot " + client.user.tag + "a7a");
    client.user.setPresence({ activity: { type: 'WATCHING', name: '.help' }, status: "dnd" });
})

client.on('guildMemberRemove', async member => {
    if (member.guild.id !== config.serverID) return
    claudette.find({ userID: member.id }, async function (err, docs) {
        await docs.forEach(async a => {
            await claudette.findOneAndDelete({ userID: member.id, code: a.code, server: a.server, link: a.link })
        })
    })
})





const Auto = require('./src/database/models/a7a.js');

client.on('message', async (message) => {
    if (message.author.bot) return; // تجاهل رسائل البوتات

    const question = message.content;
    const guildID = message.guild?.id; // استخراج معرِّف السيرفر بشكل آمن

    try {
        // التحقق من أن guildID ليس null قبل الاستفسار في قاعدة البيانات
        if (guildID) {
            const result = await Auto.findOne({ question, guildID });

            if (result) {
                message.reply(`${result.answer}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
});


const moment = require('moment');
const Guild = require('./src/database/models/GuildSettings.js');
const WelcomeSchema = require('./src/database/models/welcome.js');
const { createCanvas, loadImage } = require('canvas');
const Jimp = require('jimp');

client.on('guildMemberAdd', async (member) => {
  const canvas = createCanvas(1080, 591);
  const ctx = canvas.getContext('2d');

  try {
    const welcomeSettings = await WelcomeSchema.findOne({ guildId: member.guild.id });

    if (welcomeSettings && welcomeSettings.welcomeChannel) {
      const welcomeChannel = member.guild.channels.cache.get(welcomeSettings.welcomeChannel);

      if (welcomeChannel) {
        if (welcomeSettings.isEnabled) {
          const background = await loadImage('https://cdn.discordapp.com/attachments/1081326464227618837/1194360596183916645/Capture.PNG?ex=65b011fc&is=659d9cfc&hm=6ddfe6732861ab908fd07acf88b5a639807857909d1fe22b77f28cd96139eca6&');
          let avatar = await loadImage(member.user.displayAvatarURL({ format: 'png' }));

          avatar = await Jimp.read(avatar.src);
          avatar.resize(342, 342); // قم بتغيير الحجم حسب احتياجك

          ctx.drawImage(background, 0, 0, 1080, 591);
          ctx.drawImage(avatar, 370, 87);
          ctx.font = '40px Arial';
          ctx.fillText(member.user.tag, 447, 476);
          ctx.font = '36px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(member.user.discriminator, 76, 498);
          ctx.fillText('join', 898, 498);

          const welcomeMessage = welcomeSettings.welcomeMessage
            .replace(/\[user\]/g, `<@${member.user.id}>`)
            .replace(/\[guild\]/g, member.guild.name)
            .replace(/\[user_name\]/g, `${member.user.username}`)
            .replace(/\[memberCount\]/g, `${member.guild.memberCount}`)
            


          await welcomeChannel.send({ content: welcomeMessage, files: [canvas.toBuffer()] });
        } else {
          const welcomeMessage = welcomeSettings.welcomeMessage
            .replace(/\[user\]/g, `<@${member.user.id}>`)
            .replace(/\[guild\]/g, member.guild.name)
            .replace(/\[user_name\]/g, `${member.user.username}`)

            .replace(/\[memberCount\]/g, `${member.guild.memberCount}`)


          await welcomeChannel.send(welcomeMessage);
        }
      } else {
        console.error('القناة المحددة غير صالحة.');
      }
    }
  } catch (error) {
    console.error(error);
  }
});




const XPModel   = require('./src/database/models/LevelRole.js');



client.on('message', async (message) => {
  const user = message.author;

  let xpData = await XPModel.findOne({ userId: user.id });
if (!xpData) {
  xpData = new XPModel({
    userId: user.id,
    xp: 1,
  });
}

  const calculateUserXp = (xp) => Math.floor(0.1 * Math.sqrt(xp));

  if (!message.author.bot) {
    const xp = Math.ceil(Math.random() * (5 * 10));
    const level = calculateUserXp(xpData.xp);
    const newLevel = calculateUserXp(xpData.xp + xp);

    if (newLevel > level) {
      message.channel.send(`@${message.author.username}, **GG Your Level Up To ${newLevel} ** `);
    }

    xpData.xp += xp;
    await xpData.save();
  }
});

client.on("message", async (message) => {
  // Check if the message is from a bot
  if (message.author.bot) return;

  // التحقق من أن الرسالة في القناة المخصصة للاقتراحات
  const guildSettings = await GuildSettings.findOne({ guildId: message.guild.id });

  if (!guildSettings || !guildSettings.suggestion.suggestionChannelID) {
    return console.error("");
  }

  const suggestionTargetChannel = message.guild.channels.cache.get(guildSettings.suggestion.suggestionChannelID);

  if (!suggestionTargetChannel) {
    return console.error("Target channel not found.");
  }

  // التحقق إذا كانت الرسالة تم إرسالها في القناة المحددة للاقتراح
  if (message.channel.id !== guildSettings.suggestion.suggestionChannelID) {
    // لا تقم بتنفيذ السلوك إذا لم تكن في القناة المحددة
    return;
  }

  // بناء Embed للاقتراح
  const suggestionEmbed = new Discord.MessageEmbed()
    .setTitle("New Suggestion")
    .setDescription(`**${message.content}**`)
    .setColor(guildSettings.suggestion.suggestioncolor)
    .setFooter(guildSettings.suggestion.footer.replace(/\{user_tag\}/g, message.author.tag));


  // حذف رسالة العضو
  message.delete()
    .then(() => {
      console.log("User's message deleted successfully.");
    })
    .catch((error) => {
      console.error("Error deleting user's message:", error);
    });

  // إرسال الاقتراح إلى القناة المحددة
  suggestionTargetChannel.send(suggestionEmbed)
    .then((suggestionMessage) => {
      console.log("Suggestion sent to the target channel.");

      // الردود المحددة من قبل العضو
      const userSelectedReactions = [];

      if (guildSettings.suggestion.reaction === "2") {
        userSelectedReactions.push("👍", "👎");
      } else if (guildSettings.suggestion.reaction === "3") {
        userSelectedReactions.push("✅", "❌");
      }

      // إضافة الردود المحددة إلى رسالة الاقتراح
      userSelectedReactions.forEach((reaction) => {
        suggestionMessage.react(reaction)
          .then(() => {
            console.log(`Reaction ${reaction} added to the suggestion message.`);
          })
          .catch((error) => {
            console.error(`Error adding ${reaction} reaction to the suggestion message:`, error);
          });
      });
    })
    .catch((error) => {
      console.error("Error sending suggestion to the target channel:", error);
    });
});
client.on('guildMemberRemove', async member => {
  try {
    // استرجاع إعدادات الترحيب والمغادرة من قاعدة البيانات أو من أي مكان تخزن فيه الإعدادات
    const welcomeSettings = await WelcomeSchema.findOne({ guildId: member.guild.id });

    if (!welcomeSettings || !welcomeSettings.leaveChannel) {
      // إذا لم يتم تحديد قناة المغادرة، لا يتم إرسال رسالة
      return;
    }

    const leaveChannel = member.guild.channels.cache.get(welcomeSettings.leaveChannel);

    if (!leaveChannel || leaveChannel.type !== 'text') {
      // إذا كانت قناة المغادرة غير صالحة، لا يتم إرسال رسالة
      console.error('قناة المغادرة غير صالحة.');
      return;
    }

    // إنشاء رسالة توديع
    const leaveMessage = welcomeSettings.leaveMessage || 'وداعًا {member}';

    // إرسال الرسالة في قناة المغادرة
    leaveChannel.send(leaveMessage.replace(/\[user\]/g, `<@${member.user.id}>`)
                                   .replace(/\[user_name\]/g, `${member.user.username}`)
    );
  } catch (err) {
    console.error('حدث خطأ أثناء معالجة الحدث guildMemberRemove:', err);
  }
});
const Protection = require('./src/database/models/protection.js');

client.on('message', async (message) => {
  try {
    if (!message.guild || message.author.bot) return;

    const protectionSettings = await Protection.findOne({ guildId: message.guild.id });

    if (protectionSettings && protectionSettings.linkProtection) {
      if (containsLink(message.content)) {
        if (message.channel.id !== protectionSettings.excludedRoom) {
          message.delete();
          message.author.send('ارسل الروابط في الروم الي متحدده ليك.');
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
});

function containsLink(text) {
  const linkRegex = /(http[s]?:\/\/[^\s]+)/gi;
  return linkRegex.test(text);
}

client.on('guildMemberAdd', async (member) => {
  try {
    const guild = member.guild;
    const protectionSettings = await Protection.findOne({ guildId: guild.id });

    // Check if bot protection is enabled in the server
    if (protectionSettings && protectionSettings.botProtection && protectionSettings.botProtection.enabled) {
      // Check if the member is a bot and not in the allowed bot IDs list
      if (member.user.bot && !protectionSettings.botProtection.allowedBotIds.includes(member.user.id)) {
        // Kick unauthorized bot
        await member.kick('Unauthorized bot entry.');
      }
    }
  } catch (err) {
    console.error(err);
  }
});
const discord = require('discord.js');

const Logging = require('./src/database/models/log.js');

client.on("guildMemberRemove", async (member) => {
  console.log(`${member.user.tag} has left the server.`);
  try {
    // احصل على إعدادات السجل من قاعدة البيانات
    const logging = await Logging.findOne({ guildId: member.guild.id });

    // التحقق من وجود الإعدادات وتفعيل تسجيل الأحداث
    if (logging && logging.server_events.toggle === "true") {
      const channelEmbed = await member.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === "#000000") color = member.client.color.red;

        if (logging.server_events.member_leave === "true") {
          const embed = new discord.MessageEmbed()
            .setTitle(':outbox_tray: Member Left')
            .setAuthor(`${member.guild.name}`, member.guild.iconURL({ dynamic: true }))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member} (**${member.user.tag}**)`)
            .addField('Account created on', moment(member.user.createdAt).format('dddd, MMMM Do YYYY'))
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});
client.on("guildMemberAdd", async (member) => {
  console.log(`${member.user.tag} has joined the server.`);
  try {
    // احصل على إعدادات السجل من قاعدة البيانات
    const logging = await Logging.findOne({ guildId: member.guild.id });

    // التحقق من وجود الإعدادات وتفعيل تسجيل الأحداث
    if (logging && logging.server_events.toggle === "true") {
      const channelEmbed = await member.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === "#000000") color = member.client.color.green; // يجب تحديد لون للدخول

        if (logging.server_events.member_join === "true") {
          const embed = new discord.MessageEmbed()
            .setTitle(':inbox_tray: Member Joined')
            .setAuthor(`${member.guild.name}`, member.guild.iconURL({ dynamic: true }))
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${member} (**${member.user.tag}**)`)
            .addField('Account created on', moment(member.user.createdAt).format('dddd, MMMM Do YYYY'))
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});


client.on("voiceStateUpdate", async (oldState, newState) => {
  // احصل على إعدادات السجل من قاعدة البيانات
  const logging = await Logging.findOne({ guildId: newState.guild.id });

  // التحقق من وجود الإعدادات وتفعيل تسجيل الأحداث
  if (logging && logging.server_events.toggle === "true") {
    const channelEmbed = await newState.guild.channels.cache.get(logging.server_events.channel);

    if (channelEmbed) {
      let color = logging.server_events.color;
      if (color === "#000000") color = member.client.color.blue; // تحديد لون لحدث الانضمام إلى القناة الصوتية

      // التحقق مما إذا كان العضو قد انضم إلى قناة صوتية
      if (newState.channel) {
        if (logging.server_events.voice.join === "true") {
          const embed = new discord.MessageEmbed()
            .setTitle(':microphone2: Member Joined Voice Channel')
            .setAuthor(`${newState.guild.name}`, newState.guild.iconURL({ dynamic: true }))
            .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newState.member} (**${newState.member.user.tag}**) joined the voice channel **${newState.channel.name}**`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  }
});
client.on("voiceStateUpdate", async (oldState, newState) => {
  // Get logging settings from the database
  const logging = await Logging.findOne({ guildId: newState.guild.id });

  // Check for logging settings and event activation
  if (logging && logging.server_events.toggle === "true") {
    const channelEmbed = await newState.guild.channels.cache.get(logging.server_events.channel);

    if (channelEmbed) {
      let color = logging.server_events.color;
      if (color === "#000000") color = member.client.color.blue; // Set a color for the voice channel move event

      // Check if the member moved between voice channels
      if (oldState.channel !== newState.channel) {
        if (logging.server_events.voice.move === "true") {
          const embed = new discord.MessageEmbed()
            .setTitle(':arrow_right: Member Moved Voice Channel')
            .setAuthor(`${newState.guild.name}`, newState.guild.iconURL({ dynamic: true }))
            .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newState.member} (**${newState.member.user.tag}**) moved from **${oldState.channel ? oldState.channel.name : 'No Voice Channel'}** to **${newState.channel ? newState.channel.name : 'No Voice Channel'}**`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  }
});
client.on("voiceStateUpdate", async (oldState, newState) => {
  // Get logging settings from the database
  const logging = await Logging.findOne({ guildId: newState.guild.id });

  // Check for logging settings and event activation
  if (logging && logging.server_events.toggle === "true") {
    const channelEmbed = await newState.guild.channels.cache.get(logging.server_events.channel);

    if (channelEmbed) {
      let color = logging.server_events.color;
      if (color === "#000000") color = member.client.color.blue; // Set a color for the voice channel leave event

      // Check if the member left a voice channel
      if (oldState.channel && !newState.channel) {
        if (logging.server_events.voice.leave === "true") {
          const embed = new discord.MessageEmbed()
            .setTitle(':arrow_left: Member Left Voice Channel')
            .setAuthor(`${newState.guild.name}`, newState.guild.iconURL({ dynamic: true }))
            .setThumbnail(newState.member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${newState.member} (**${newState.member.user.tag}**) left **${oldState.channel.name}**`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  }
});
client.on('channelCreate', async (channel) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: channel.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await channel.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.green; // Set a color for the channel creation event

        // Check if the created channel is a text or voice channel
        const channelType = channel.type === 'text' ? 'Text Channel' : 'Voice Channel';

        if (logging.server_events.channel_created === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:inbox_tray: New ${channelType} Created`)
            .setAuthor(`${channel.guild.name}`, channel.guild.iconURL({ dynamic: true }))
            .setDescription(`A new ${channelType} **${channel.name}** has been created.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});
client.on('channelUpdate', async (oldChannel, newChannel) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: newChannel.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await newChannel.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.orange; // Set a color for the channel update event

        // Check if the updated channel is a text or voice channel
        const channelType = newChannel.type === 'text' ? 'Text Channel' : 'Voice Channel';

        if (logging.server_events.channel_update === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:gear: ${channelType} Updated`)
            .setAuthor(`${newChannel.guild.name}`, newChannel.guild.iconURL({ dynamic: true }))
            .setDescription(`The ${channelType} **${newChannel.name}** has been updated.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});
client.on('channelDelete', async (deletedChannel) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: deletedChannel.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await deletedChannel.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.orange; // Set a color for the channel delete event

        // Check if the deleted channel is a text or voice channel
        const channelType = deletedChannel.type === 'text' ? 'Text Channel' : 'Voice Channel';

        if (logging.server_events.channel_delete === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:wastebasket: ${channelType} Deleted`)
            .setAuthor(`${deletedChannel.guild.name}`, deletedChannel.guild.iconURL({ dynamic: true }))
            .setDescription(`The ${channelType} **${deletedChannel.name}** has been deleted.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

// Role Creation
client.on('roleCreate', async (createdRole) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: createdRole.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await createdRole.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.green; // Set a color for the role create event

        if (logging.server_events.role_create === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:scroll: Role Created`)
            .setAuthor(`${createdRole.guild.name}`, createdRole.guild.iconURL({ dynamic: true }))
            .setDescription(`A new role **${createdRole.name}** has been created.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

// Role Deletion
client.on('roleDelete', async (deletedRole) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: deletedRole.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await deletedRole.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.red; // Set a color for the role delete event

        if (logging.server_events.role_delete === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:wastebasket: Role Deleted`)
            .setAuthor(`${deletedRole.guild.name}`, deletedRole.guild.iconURL({ dynamic: true }))
            .setDescription(`The role **${deletedRole.name}** has been deleted.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});
client.on('roleUpdate', async (oldRole, newRole) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: newRole.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await newRole.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.yellow; // Set a color for the role update event

        if (logging.server_events.role_update === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:wrench: Role Updated`)
            .setAuthor(`${newRole.guild.name}`, newRole.guild.iconURL({ dynamic: true }))
            .setDescription(`Role **${oldRole.name}** has been updated.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

// Guild Update
client.on('guildUpdate', async (oldGuild, newGuild) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: newGuild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await newGuild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.blue; // Set a color for the guild update event

        if (logging.server_events.guild_update === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:wrench: Guild Updated`)
            .setAuthor(`${newGuild.name}`, newGuild.iconURL({ dynamic: true }))
            .setDescription(`Guild information has been updated.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

// Emoji Update
client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: newEmoji.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.server_events.toggle === 'true') {
      const channelEmbed = await newEmoji.guild.channels.cache.get(logging.server_events.channel);

      if (channelEmbed) {
        let color = logging.server_events.color;
        if (color === '#000000') color = member.client.color.purple; // Set a color for the emoji update event

        if (logging.server_events.emoji_update === 'true') {
          const embed = new discord.MessageEmbed()
            .setTitle(`:wrench: Emoji Updated`)
            .setAuthor(`${newEmoji.guild.name}`, newEmoji.guild.iconURL({ dynamic: true }))
            .setDescription(`Emoji **${oldEmoji.name}** has been updated.`)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});











client.on('guildMemberUpdate', async (oldMember, newMember) => {
  try {
    // Get logging settings from the database
    const logging = await Logging.findOne({ guildId: newMember.guild.id });

    // Check for logging settings and event activation
    if (logging && logging.member_events.toggle === 'true') {
      const channelEmbed = await newMember.guild.channels.cache.get(logging.member_events.channel);

      if (channelEmbed) {
        let color = logging.member_events.color;
        if (color === '#000000') color = '#FFA500'; // Orange color

        if (logging.member_events.role_update === 'true' && oldMember.roles.cache.size !== newMember.roles.cache.size) {
          const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
          const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

          const embed = new discord.MessageEmbed()
            .setTitle(':busts_in_silhouette: Member Roles Updated')
            .setAuthor(`${newMember.guild.name}`, newMember.guild.iconURL({ dynamic: true }))
            .setDescription(`${newMember} (**${newMember.user.tag}**) roles have been updated.`)
            .addField('Added Roles', addedRoles.map(role => role.name).join(', ') || 'None')
            .addField('Removed Roles', removedRoles.map(role => role.name).join(', ') || 'None')
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }

        if (logging.member_events.name_change === 'true' && oldMember.displayName !== newMember.displayName) {
          const embed = new discord.MessageEmbed()
            .setTitle(':busts_in_silhouette: Member Name Change')
            .setAuthor(`${newMember.guild.name}`, newMember.guild.iconURL({ dynamic: true }))
            .setDescription(`${newMember} (**${newMember.user.tag}**) name has been changed.`)
            .addField('Old Name', oldMember.displayName)
            .addField('New Name', newMember.displayName)
            .setTimestamp()
            .setColor(color);

          channelEmbed.send(embed).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});


client.on('messageDelete', async (message) => {
  try {
    const logSettings = await Logging.findOne({ guildId: message.guild.id });

    if (logSettings && logSettings.message_events.toggle === "true" && logSettings.message_events.deleted === "true") {
      const channel = client.channels.cache.get(logSettings.message_events.channel);
      if (channel) {
        const embed = new discord.MessageEmbed()
          .setTitle(':wastebasket: Message Deleted')
          .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
          .setDescription(`Deleted message in ${message.channel}: ${message.content}`)
          .setTimestamp()
          .setColor(logSettings.message_events.color);

        channel.send(embed).catch(() => {});
      }
    }
  } catch (error) {
    console.error(error);
  }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  try {
    const logSettings = await Logging.findOne({ guildId: newMessage.guild.id });

    if (logSettings && logSettings.message_events.toggle === "true" && logSettings.message_events.edited === "true") {
      const channel = client.channels.cache.get(logSettings.message_events.channel);
      if (channel) {
        const embed = new discord.MessageEmbed()
          .setTitle(':pencil2: Message Edited')
          .setAuthor(`${newMessage.author.tag}`, newMessage.author.displayAvatarURL({ dynamic: true }))
          .setDescription(`Message edited in ${newMessage.channel}\n**Old Message:** ${oldMessage.content}\n**New Message:** ${newMessage.content}`)
          .setTimestamp()
          .setColor(logSettings.message_events.color);

        channel.send(embed).catch(() => {});
      }
    }
  } catch (error) {
    console.error(error);
  }
});

client.on('guildBanAdd', async (guild, user) => {
  try {
    const guildSettings = await Logging.findOne({ guildId: guild.id });

    // Check if logging is enabled for bans
    if (guildSettings && guildSettings.moderation && guildSettings.moderation.ban === 'true') {
      const logChannel = guild.channels.cache.get(guildSettings.moderation.channel);

      if (logChannel) {
        const embed = createBanEmbed(user, 'Banned', 'Banned for violating server rules', guildSettings.moderation.color);
        logChannel.send(embed).catch(() => {});
      }
    }
  } catch (error) {
    console.error(error);
  }
});

client.on('guildBanRemove', async (guild, user) => {
  try {
    const guildSettings = await Logging.findOne({ guildId: guild.id });

    // Check if logging is enabled for unbans
    if (guildSettings && guildSettings.moderation && guildSettings.moderation.unban === 'true') {
      const logChannel = guild.channels.cache.get(guildSettings.moderation.channel);

      if (logChannel) {
        const embed = createBanEmbed(user, 'Unbanned', 'Unbanned after a review', guildSettings.moderation.color);
        logChannel.send(embed).catch(() => {});
      }
    }
  } catch (error) {
    console.error(error);
  }
});

function createBanEmbed(user, action, reason, color) {
  return new Discord.MessageEmbed()
    .setTitle(`:hammer: Member ${action}`)
    .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
    .setDescription(`${user} (**${user.tag}**)`)
    .addField('Action', action)
    .addField('Reason', reason)
    .setTimestamp()
    .setColor(color);
}


client.on('guildMemberRemove', async (member) => {
  if (member.user.bot) return; // Ignore kicks for bots

  try {
    const guildSettings = await Logging.findOne({ guildId: member.guild.id });

    // Check if logging is enabled for kicks
    if (guildSettings && guildSettings.moderation && guildSettings.moderation.kick === 'true') {
      const logChannel = member.guild.channels.cache.get(guildSettings.moderation.channel);

      if (logChannel) {
        const embed = createModerationEmbed(member.user, 'Kicked', 'Kicked for violating server rules', guildSettings.moderation.color);
        logChannel.send(embed).catch(() => {});
      }
    }
  } catch (error) {
    console.error(error);
  }
});

function createModerationEmbed(user, action, reason, color) {
  return new Discord.MessageEmbed()
    .setTitle(`:boot: Member ${action}`)
    .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
    .setDescription(`${user} (**${user.tag}**)`)
    .addField('Action', action)
    .addField('Reason', reason)
    .setTimestamp()
    .setColor(color);
}













































const server = require('./src/server');
server(client);

require("./src/database/connect.js")(client);
client.login(config.bot.token);
