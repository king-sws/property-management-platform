// app/(dashboard)/dashboard/notifications/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getNotifications, getUnreadNotificationCount } from "@/actions/notifications";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const metadata = {
  title: "Notifications",
  description: "View and manage your notifications",
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch initial notifications
  const notificationsResult = await getNotifications({ limit: 50 });
  const unreadCountResult = await getUnreadNotificationCount();

  const initialNotifications = notificationsResult.success 
    ? notificationsResult.data?.notifications || [] 
    : [];
  
  const initialUnreadCount = unreadCountResult.success 
    ? unreadCountResult.data?.count || 0 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with your property management activities
        </p>
      </div>

      <NotificationsList
        initialNotifications={initialNotifications}
        initialUnreadCount={initialUnreadCount}
      />
    </div>
  );
}