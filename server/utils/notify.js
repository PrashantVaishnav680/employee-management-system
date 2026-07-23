import Notification from "../models/Notification.js";

export const notifyUser = async ({ user, title, message }) => {
  return Notification.create({ user, title, message });
};
