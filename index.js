const { Client, GatewayIntentBits, Events } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error('Missing DISCORD_TOKEN environment variable. Set it before starting the bot.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const PREFIX = '!';

// In-memory store for giveaways (starter boilerplate — swap for a real DB in production)
const giveaways = [];
let nextId = 1;

// Simple command handler
const commands = {
  ping: async (message) => {
    await message.reply('Pong!');
  },

  giveaway: async (message, args) => {
    const title = args.join(' ').trim();

    if (!title) {
      await message.reply('Usage: `!giveaway <title>`');
      return;
    }

    const giveaway = {
      id: nextId++,
      title,
      createdAt: new Date().toISOString(),
      createdBy: message.author.id,
    };

    giveaways.push(giveaway);

    await message.reply(`🎉 Giveaway #${giveaway.id} created: **${giveaway.title}**`);
  },

  giveaways: async (message) => {
    if (giveaways.length === 0) {
      await message.reply('There are no active giveaways.');
      return;
    }

    const list = giveaways
      .map((g) => `#${g.id} — ${g.title}`)
      .join('\n');

    await message.reply(`Current giveaways:\n${list}`);
  },
};

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot is ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = commands[commandName];
    if (!command) return;

    await command(message, args);
  } catch (error) {
    console.error('Error handling message:', error);
    try {
      await message.reply('Something went wrong while processing that command.');
    } catch (replyError) {
      console.error('Failed to send error reply:', replyError);
    }
  }
});

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

client.on(Events.ShardError, (error) => {
  console.error('Discord shard error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    await client.destroy();
    console.log('Discord client destroyed. Goodbye!');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

client.login(TOKEN).catch((error) => {
  console.error('Failed to log in to Discord:', error);
  process.exit(1);
});
