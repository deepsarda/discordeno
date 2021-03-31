import { botId } from "../../bot.ts";
import { RequestManager } from "../../rest/request_manager.ts";
import { endpoints } from "../../util/constants.ts";
import {
  isHigherPosition,
  requireBotGuildPermissions,
} from "../../util/permissions.ts";

/** Remove a role from the member */
export async function removeRole(
  guildId: string,
  memberId: string,
  roleId: string,
  reason?: string,
) {
  const isHigherRolePosition = await isHigherPosition(
    guildId,
    botId,
    roleId,
  );
  if (
    !isHigherRolePosition
  ) {
    throw new Error(Errors.BOTS_HIGHEST_ROLE_TOO_LOW);
  }

  await requireBotGuildPermissions(guildId, ["MANAGE_ROLES"]);

  const result = await RequestManager.delete(
    endpoints.GUILD_MEMBER_ROLE(guildId, memberId, roleId),
    { reason },
  );

  return result;
}