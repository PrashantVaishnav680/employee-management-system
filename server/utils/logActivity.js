import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({ actor, action, entity, entityId = "", details = "" }) => {
  await ActivityLog.create({ actor, action, entity, entityId, details });
};
