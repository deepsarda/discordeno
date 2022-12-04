import { AuditLogEvents, BigString, DiscordAuditLog } from '@discordeno/types'
import { iconHashToBigInt } from '@discordeno/utils'
import type { RestManager } from '../../restManager.js'
import { ApplicationCommand } from '../../transformers/applicationCommand.js'
import { AuditLogEntry } from '../../transformers/auditLogEntry.js'
import { AutoModerationRule } from '../../transformers/automodRule.js'
import { Channel } from '../../transformers/channel.js'
import { Integration } from '../../transformers/integration.js'
import { User } from '../../transformers/member.js'
import { ScheduledEvent } from '../../transformers/scheduledEvent.js'
import { Webhook } from '../../transformers/webhook.js'

export interface AuditLog {
  auditLogEntries: AuditLogEntry[]
  autoModerationRules?: AutoModerationRule[]
  guildScheduledEvents?: ScheduledEvent[]
  integrations: Array<Partial<Omit<Integration, 'guildId'>>>
  threads: Channel[]
  users: User[]
  webhooks: Webhook[]
  applicationCommands: ApplicationCommand[]
}

// TODO: Move `AuditLog` into its own transformer file.

/**
 * Gets a guild's audit log.
 *
 * @param bot - The bot instance to use to make the request.
 * @param guildId - The ID of the guild to get the audit log of.
 * @param options - The parameters for the fetching of the audit log.
 * @returns An instance of {@link AuditLog}.
 *
 * @remarks
 * Requires the `VIEW_AUDIT_LOG` permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log}
 */
export async function getAuditLog (
  rest: RestManager,
  guildId: BigString,
  options?: GetGuildAuditLog
): Promise<AuditLog> {
  if (options?.limit) {
    options.limit =
      options.limit >= 1 && options.limit <= 100 ? options.limit : 50
  }

  const result = await rest.runMethod<DiscordAuditLog>(
    rest,
    'GET',
    rest.constants.routes.GUILD_AUDIT_LOGS(guildId, options)
  )

  const id = rest.transformers.snowflake(guildId)
  return {
    auditLogEntries: result.audit_log_entries.map((entry) =>
      rest.transformers.auditLogEntry(rest, entry)
    ),
    autoModerationRules: result.auto_moderation_rules?.map((rule) =>
      rest.transformers.automodRule(rest, rule)
    ),
    guildScheduledEvents: result.guild_scheduled_events?.map((event) =>
      rest.transformers.scheduledEvent(rest, event)
    ),
    integrations: result.integrations.map((integration) => ({
      id: integration.id
        ? rest.transformers.snowflake(integration.id)
        : undefined,
      name: integration.name,
      type: integration.type,
      enabled: integration.enabled,
      syncing: integration.syncing,
      roleId: integration.role_id
        ? rest.transformers.snowflake(integration.role_id)
        : undefined,
      enableEmoticons: integration.enable_emoticons,
      expireBehavior: integration.expire_behavior,
      expireGracePeriod: integration.expire_grace_period,
      user: integration.user
        ? rest.transformers.user(rest, integration.user)
        : undefined,
      account: integration.account
        ? {
            id: rest.transformers.snowflake(integration.account.id),
            name: integration.account.name
          }
        : undefined,
      syncedAt: integration.synced_at
        ? Date.parse(integration.synced_at)
        : undefined,
      subscriberCount: integration.subscriber_count,
      revoked: integration.revoked,
      application: integration.application
        ? {
            id: rest.transformers.snowflake(integration.application.id),
            name: integration.application.name,
            icon: integration.application.icon
              ? iconHashToBigInt(integration.application.icon)
              : undefined,
            description: integration.application.description,
            bot: integration.application.bot
              ? rest.transformers.user(rest, integration.application.bot)
              : undefined
          }
        : undefined
    })),
    threads: result.threads.map((thread) =>
      rest.transformers.channel(rest, { channel: thread, guildId: id })
    ),
    users: result.users.map((user) => rest.transformers.user(rest, user)),
    webhooks: result.webhooks.map((hook) =>
      rest.transformers.webhook(rest, hook)
    ),
    applicationCommands: result.application_commands.map((applicationCommand) =>
      rest.transformers.applicationCommand(rest, applicationCommand)
    )
  }
}

/** https://discord.com/developers/docs/resources/audit-log#get-guild-audit-log-query-string-parameters */
export interface GetGuildAuditLog {
  /** Entries from a specific user ID */
  userId?: BigString | string
  /** Entries for a specific audit log event */
  actionType?: AuditLogEvents
  /** Entries that preceded a specific audit log entry ID */
  before?: BigString | string
  /** Maximum number of entries (between 1-100) to return, defaults to 50 */
  limit?: number
}
