import { BigString } from '@discordeno/types'
import type { RestManager } from '../../restManager.js'

/**
 * Deletes a webhook message.
 *
 * @param bot - The bot instance to use to make the request.
 * @param webhookId - The ID of the webhook to delete the message belonging to.
 * @param token - The webhook token, used to manage the webhook.
 * @param messageId - The ID of the message to delete.
 * @param options - The parameters for the deletion of the message.
 *
 * @remarks
 * Fires a _Message Delete_ gateway event.
 *
 * @see {@link https://discord.com/developers/docs/resources/webhook#delete-webhook}
 */
export async function deleteWebhookMessage (
  rest: RestManager,
  webhookId: BigString,
  token: string,
  messageId: BigString,
  options?: DeleteWebhookMessageOptions
): Promise<void> {
  return await rest.runMethod<void>(
    rest,
    'DELETE',
    rest.constants.routes.WEBHOOK_MESSAGE(webhookId, token, messageId, options)
  )
}

export interface DeleteWebhookMessageOptions {
  /** id of the thread the message is in */
  threadId: BigString
}
