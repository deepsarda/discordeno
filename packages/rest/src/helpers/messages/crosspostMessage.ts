import { BigString, DiscordMessage } from '@discordeno/types'
import type { RestManager } from '../../restManager.js'
import { Message } from '../../transformers/message.js'

export const publishMessage = crosspostMessage

/**
 * Cross-posts a message posted in an announcement channel to subscribed channels.
 *
 * @param bot - The bot instance to use to make the request.
 * @param channelId - The ID of the announcement channel.
 * @param messageId - The ID of the message to cross-post.
 * @returns An instance of the cross-posted {@link Message}.
 *
 * @remarks
 * Requires the `SEND_MESSAGES` permission.
 *
 * If not cross-posting own message:
 * - Requires the `MANAGE_MESSAGES` permission.
 *
 * Fires a _Message Create_ event in the guilds the subscribed channels are in.
 *
 * @see {@link https://discord.com/developers/docs/resources/channel#crosspost-message}
 */
export async function crosspostMessage (
  rest: RestManager,
  channelId: BigString,
  messageId: BigString
): Promise<Message> {
  const result = await rest.runMethod<DiscordMessage>(
    rest,
    'POST',
    rest.constants.routes.CHANNEL_MESSAGE_CROSSPOST(channelId, messageId)
  )

  return rest.transformers.message(rest, result)
}
