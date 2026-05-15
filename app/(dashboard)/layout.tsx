"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  FolderKanban,
  Hammer,
  Package,
  Wallet,
  FileBarChart,
  ChevronLeft,
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navSections = [
  {
    label: "UTAMA",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: Map, label: "Peta Proyek", href: "/peta" },
    ],
  },
  {
    label: "PROYEK",
    items: [
      { icon: FolderKanban, label: "Daftar Proyek", href: "/proyek" },
    ],
  },
  {
    label: "OPERASIONAL",
    items: [
      { icon: Package, label: "Material", href: "/material" },
      { icon: Hammer, label: "Tukang", href: "/tukang" },
    ],
  },
  {
    label: "KEUANGAN",
    items: [
      { icon: Wallet, label: "Keuangan", href: "/keuangan" },
      { icon: FileBarChart, label: "Laporan", href: "/laporan" },
    ],
  },
];

function SidebarNav({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full z-40 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        expanded ? "w-[240px]" : "w-[68px]"
      )}
    >
      {/* Logo / Brand */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-3">
        <div className="w-8 h-8 rounded bg-safety flex items-center justify-center shrink-0">
          <span className="font-heading font-bold text-safety-foreground text-sm">K</span>
        </div>
        {expanded && (
          <div className="overflow-hidden">
            <h1 className="font-heading font-semibold text-sm text-sidebar-foreground truncate">
              Konstruksi
            </h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
              Manajemen Proyek
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {expanded && (
              <span className="label-architectural px-4 mb-2 block text-sidebar-foreground/40">
                {section.label}
              </span>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                const navLink = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon
                      className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-safety")}
                    />
                    {expanded && <span className="truncate">{item.label}</span>}
                  </Link>
                );

                if (!expanded) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return navLink;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick Action */}
      <div className="px-2 pb-2">
        {expanded ? (
          <Link href="/proyek/baru">
            <Button className="w-full gap-2 bg-safety text-safety-foreground hover:bg-safety/90 rounded font-semibold text-xs uppercase tracking-wider">
              <Plus className="w-4 h-4" />
              Proyek Baru
            </Button>
          </Link>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/proyek/baru">
                <Button
                  size="icon"
                  className="w-full bg-safety text-safety-foreground hover:bg-safety/90"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Proyek Baru</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              !expanded && "rotate-180"
            )}
          />
        </button>
      </div>
    </div>
  );
}

function Topbar({ sidebarExpanded }: { sidebarExpanded: boolean }) {
  const pathname = usePathname();

  // Generate breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header
      className={cn(
        "h-14 border-b border-border bg-background flex items-center justify-between px-6 fixed top-0 right-0 left-0 md:left-auto z-30 transition-all duration-300",
        sidebarExpanded ? "md:left-[240px]" : "md:left-[68px]"
      )}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.href}>
            <span className="text-muted-foreground/40">/</span>
            {crumb.isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center max-w-md w-full mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari proyek, material, tukang..."
            className="w-full h-8 pl-9 pr-4 bg-muted/50 border border-border rounded text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-safety focus:ring-1 focus:ring-safety/30 transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              className="relative p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-critical rounded-full" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Notifikasi</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  AP
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="font-medium text-sm">Andi Prasetyo</p>
              <p className="text-xs text-muted-foreground">Project Manager</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Mobile sidebar
function MobileSidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="md:hidden fixed top-3 left-3 z-50 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5" />
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-sidebar text-sidebar-foreground p-0 border-sidebar-border">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-3">
          <div className="w-8 h-8 rounded bg-safety flex items-center justify-center">
            <span className="font-heading font-bold text-safety-foreground text-sm">K</span>
          </div>
          <div>
            <h1 className="font-heading font-semibold text-sm">Konstruksi</h1>
            <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
              Manajemen Proyek
            </p>
          </div>
        </div>
        <nav className="flex-1 py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <span className="label-architectural px-4 mb-2 block text-sidebar-foreground/40">
                {section.label}
              </span>
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Icon className={cn("w-[18px] h-[18px]", isActive && "text-safety")} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-background bg-blueprint-grid">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <SidebarNav
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar />

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col pt-14",
          "md:ml-[68px]",
          sidebarExpanded && "md:ml-[240px]"
        )}
      >
        <Topbar sidebarExpanded={sidebarExpanded} />
        <main className="p-4 md:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
