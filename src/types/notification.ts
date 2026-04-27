import {
  Notification,
  NotificationPreference,
  NotificationStatus,
  NotificationType,
  Role,
  User,
} from "../../prisma/generated/prisma";
export interface NotificationPrefWithUser extends NotificationPreference {
  User: {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    phone: string | null;
    email: string;
    role: Role;
  };
}

export type NotificationPreferenceResponse = NotificationPrefWithUser | null;

export interface UpdateNotifyPrefDto {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  inApp?: boolean;
  newsletter?: boolean;
}

export interface CreateNotifyDto {
  title: string;
  message: string;
  type: NotificationType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<any, any>;
  recipientIds: string[];
  status: NotificationStatus;
  scheduledAt?: Date;
}

export interface UpdateNotifyStatus {
  status?: NotificationStatus;
  readAt?: Date;
}

export interface WorkerInputData {
  data: Notification;
  user: Omit<User, "password">;
}

export interface InAppNotificationData {
  title: string;
  message: string;
  date: Date;
  id: string;
}
