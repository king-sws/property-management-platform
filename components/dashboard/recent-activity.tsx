// components/dashboard/recent-activity.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import {
  CreditCard,
  Ticket,
  FileText,
  User,
  LogIn,
  LogOut,
  Settings,
  Bell,
  Home,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Trash2,
  Edit3,
  Activity,
} from "lucide-react";

export async function RecentActivity({ userId }: { userId: string }) {
  const activities = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const getActivityConfig = (type: string) => {
    if (type.includes("PAYMENT_RECEIVED") || type.includes("PAYMENT_SUCCESS"))
      return { icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-900", iconColor: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
    if (type.includes("PAYMENT_FAILED") || type.includes("PAYMENT_OVERDUE"))
      return { icon: XCircle, bg: "bg-rose-100 dark:bg-rose-900", iconColor: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" };
    if (type.includes("PAYMENT"))
      return { icon: CreditCard, bg: "bg-emerald-100 dark:bg-emerald-900", iconColor: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
    if (type.includes("TICKET_RESOLVED") || type.includes("TICKET_CLOSED"))
      return { icon: CheckCircle2, bg: "bg-violet-100 dark:bg-violet-900", iconColor: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500" };
    if (type.includes("TICKET_OPENED") || type.includes("TICKET_CREATED"))
      return { icon: AlertCircle, bg: "bg-amber-100 dark:bg-amber-900", iconColor: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" };
    if (type.includes("TICKET"))
      return { icon: Ticket, bg: "bg-amber-100 dark:bg-amber-900", iconColor: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" };
    if (type.includes("LEASE_SIGNED") || type.includes("LEASE_CREATED"))
      return { icon: PlusCircle, bg: "bg-blue-100 dark:bg-blue-900", iconColor: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" };
    if (type.includes("LEASE_TERMINATED") || type.includes("LEASE_EXPIRED"))
      return { icon: XCircle, bg: "bg-rose-100 dark:bg-rose-900", iconColor: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" };
    if (type.includes("LEASE"))
      return { icon: FileText, bg: "bg-blue-100 dark:bg-blue-900", iconColor: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" };
    if (type.includes("LOGIN") || type.includes("SIGN_IN"))
      return { icon: LogIn, bg: "bg-sky-100 dark:bg-sky-900", iconColor: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" };
    if (type.includes("LOGOUT") || type.includes("SIGN_OUT"))
      return { icon: LogOut, bg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" };
    if (type.includes("USER") || type.includes("PROFILE"))
      return { icon: User, bg: "bg-indigo-100 dark:bg-indigo-900", iconColor: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-500" };
    if (type.includes("PROPERTY") || type.includes("UNIT"))
      return { icon: Home, bg: "bg-teal-100 dark:bg-teal-900", iconColor: "text-teal-600 dark:text-teal-400", dot: "bg-teal-500" };
    if (type.includes("DELETE") || type.includes("REMOVE"))
      return { icon: Trash2, bg: "bg-rose-100 dark:bg-rose-900", iconColor: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500" };
    if (type.includes("UPDATE") || type.includes("EDIT"))
      return { icon: Edit3, bg: "bg-orange-100 dark:bg-orange-900", iconColor: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" };
    if (type.includes("CREATE") || type.includes("ADD"))
      return { icon: PlusCircle, bg: "bg-green-100 dark:bg-green-900", iconColor: "text-green-600 dark:text-green-400", dot: "bg-green-500" };
    if (type.includes("NOTIFICATION") || type.includes("ALERT"))
      return { icon: Bell, bg: "bg-yellow-100 dark:bg-yellow-900", iconColor: "text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-500" };
    if (type.includes("SETTINGS") || type.includes("CONFIG"))
      return { icon: Settings, bg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" };
    return { icon: Activity, bg: "bg-slate-100 dark:bg-slate-800", iconColor: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" };
  };

  const formatType = (type: string) =>
    type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {activities.length} events
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[360px] gap-2 text-muted-foreground">
            <Activity className="h-8 w-8 opacity-30" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div
            className="overflow-y-auto activity-scroll"
            style={{ height: "360px" }}
          >
            <div className="relative py-1 pr-3">

              {/*
                Timeline spine — drawn behind everything.
                Starts and ends with enough offset so it
                doesn't poke out above the first or below the last icon.
              */}
              <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" />

              <div className="space-y-0.5">
                {activities.map((activity) => {
                  const config = getActivityConfig(activity.type);
                  const Icon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 py-2 relative group"
                    >
                      {/*
                        THE FIX for spine bleeding through the icon top:
                        - Use `outline` instead of `ring` — outline renders
                          on top of the element itself, not inside it, so it
                          fully masks the spine line at the top and bottom edge
                          of the circle regardless of dark/light mode or card bg.
                        - outline-4 gives a thick enough gap to hide the line.
                        - outline-card matches the card surface color token exactly.
                        - No transparency in the bubble bg (900 not 950/50).
                      */}
                      <div
                        className={`
                          relative z-10 shrink-0
                          flex items-center justify-center
                          w-9 h-9 rounded-full
                          ${config.bg}
                          outline outline-[3px] outline-card
                          transition-transform duration-150
                          group-hover:scale-110
                        `}
                      >
                        <Icon className={`h-4 w-4 ${config.iconColor}`} strokeWidth={2} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm font-medium leading-snug break-words">
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
                          <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
                            {formatType(activity.type)}
                          </span>
                          <span className="text-[11px] text-muted-foreground/40 select-none">·</span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}