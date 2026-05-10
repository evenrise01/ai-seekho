"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Film,
  Rows,
  Tag,
  Users,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardProps {
  stats: {
    totalContent: number;
    publishedContent: number;
    draftContent: number;
    totalRails: number;
    totalCategories: number;
    totalUsers: number;
    pendingChanges: number;
    viewsLast30Days: number;
    viewsLast7Days: number;
  };
  recentContent: Array<{
    id: string;
    chapterTitle: string;
    toolName: string;
    status: string;
    videoStatus: string;
    createdAt: string;
  }>;
  userName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    published: {
      label: "Published",
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    draft: {
      label: "Draft",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    archived: {
      label: "Archived",
      className: "text-muted-foreground",
    },
  };
  const config = map[status];
  if (!config) return <Badge variant="secondary">{status}</Badge>;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function VideoStatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: React.ComponentProps<typeof Badge>["variant"]; className?: string }
  > = {
    ready: {
      label: "Ready",
      variant: "outline",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    processing: {
      label: "Processing",
      variant: "secondary",
      className: "animate-pulse",
    },
    uploading: {
      label: "Uploading",
      variant: "secondary",
      className: "animate-pulse",
    },
    error: { label: "Error", variant: "destructive" },
  };
  const config = map[status];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardClient({ stats, recentContent, userName }: DashboardProps) {
  const statCards = [
    {
      label: "Total Content",
      value: stats.totalContent,
      sub: `${stats.publishedContent} published · ${stats.draftContent} draft`,
      icon: Film,
      color: "text-blue-500",
    },
    {
      label: "Active Rails",
      value: stats.totalRails,
      sub: "Live on feed",
      icon: Rows,
      color: "text-emerald-500",
    },
    {
      label: "Categories",
      value: stats.totalCategories,
      sub: "Taxonomy",
      icon: Tag,
      color: "text-amber-500",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      sub: "Registered",
      icon: Users,
      color: "text-violet-500",
    },
  ];

  const quickActions = [
    {
      label: "Upload Content",
      sub: "Add a new video",
      href: "/admin/content/new",
      icon: Plus,
    },
    {
      label: "Manage Rails",
      sub: "Organise your feed",
      href: "/admin/rails",
      icon: Rows,
    },
    {
      label: "View Analytics",
      sub: "Track performance",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 p-6">

      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening with AI Seekho today.
        </p>
      </div>

      <Separator />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </CardTitle>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight">{item.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent content table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Recent Content</CardTitle>
            <CardDescription className="text-xs">
              Latest videos added to the library
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/content" className="flex items-center gap-1.5">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Title</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Video</TableHead>
                <TableHead className="text-right pr-6">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentContent.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No content yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentContent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6 font-medium text-sm max-w-[200px] truncate">
                      {item.chapterTitle}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.toolName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <VideoStatusBadge status={item.videoStatus} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(item.createdAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Card
            key={action.label}
            className="hover:bg-accent transition-colors cursor-pointer group"
            asChild
          >
            <Link href={action.href}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background group-hover:border-border/80 transition-colors">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{action.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{action.sub}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

    </div>
  );
}