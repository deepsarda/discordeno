import { BotWithCache, ScheduledEventEntityType } from "../../../deps.ts";
import { requireBotChannelPermissions, requireBotGuildPermissions } from "../../permissions.ts";

export function createScheduledEvent(bot: BotWithCache) {
  const createScheduledEvent = bot.helpers.createScheduledEvent;

  bot.helpers.createScheduledEvent = async function (guildId, options) {
    if (options.entityType === ScheduledEventEntityType.StageInstance) {
      if (!options.channelId) {
        throw new Error(
          "A channel id is required for creating a stage scheduled event.",
        );
      }

      requireBotChannelPermissions(bot, options.channelId, [
        "MANAGE_CHANNELS",
        "MUTE_MEMBERS",
        "MOVE_MEMBERS",
      ]);

      // MANAGE_EVENTS at the guild level or at least MANAGE_EVENTS for the channel_id associated with the event
      try {
        requireBotGuildPermissions(bot, guildId, [
          "MANAGE_EVENTS",
        ]);
      } catch {
        requireBotChannelPermissions(bot, options.channelId, [
          "MANAGE_EVENTS",
        ]);
      }

      return createScheduledEvent(guildId, options);
    }

    if (options.entityType === ScheduledEventEntityType.Voice) {
      if (!options.channelId) {
        throw new Error(
          "A channel id is required for creating a voice scheduled event.",
        );
      }

      requireBotChannelPermissions(bot, options.channelId, [
        "VIEW_CHANNEL",
        "CONNECT",
      ]);

      // MANAGE_EVENTS at the guild level or at least MANAGE_EVENTS for the channel_id associated with the event
      try {
        requireBotGuildPermissions(bot, guildId, [
          "MANAGE_EVENTS",
        ]);
      } catch {
        requireBotChannelPermissions(bot, options.channelId, [
          "MANAGE_EVENTS",
        ]);
      }

      return createScheduledEvent(guildId, options);
    }

    // EXTERNAL EVENTS

    requireBotGuildPermissions(bot, guildId, [
      "MANAGE_EVENTS",
    ]);

    return await createScheduledEvent(guildId, options);
  };
}