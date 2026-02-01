// app/(dashboard)/dashboard/notifications/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getNotifications, getUnreadNotificationCount } from "@/actions/notifications";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

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
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Notifications
          </Typography>
          <Typography variant="muted">
            Stay updated with your property management activities
          </Typography>
        </div>
        <NotificationsList 
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
        />
      </Stack>
    </Container>
  );
}