export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  createdAt: string;
  read: boolean;
  link?: string;
  relatedItemId?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
