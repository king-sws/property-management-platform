// components/dashboard/header-with-search.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Menu,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  Plus,
  Home,
  UserPlus,
  FileText,
  Wrench,
  Search,
  AlertCircle,
  HelpCircle,
  X,
  Loader2,
  Building2,
  DollarSign,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOut } from "@/actions/action";
import { NotificationDropdown } from "../notifications/notifications-dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SearchResult {
  id: string;
  type: "property" | "tenant" | "unit" | "lease" | "maintenance" | "payment";
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
}

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    status?: string;
  };
  unreadCount?: number;
  urgentItems?: {
    maintenanceRequests?: number;
    expiringLeases?: number;
    overduePayments?: number;
  };
  onMobileMenuToggle?: () => void;
}

const iconMap = {
  property: Home,
  tenant: User,
  unit: Building2,
  lease: FileText,
  maintenance: Wrench,
  payment: DollarSign,
};

export function DashboardHeader({
  user,
  unreadCount = 0,
  urgentItems = {},
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const totalUrgent =
    (urgentItems.maintenanceRequests || 0) +
    (urgentItems.expiringLeases || 0) +
    (urgentItems.overduePayments || 0);

  // Perform search with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  // Determine logo source with proper handling of theme state
  const logoSrc = !mounted ? '/propely-dark.svg' : theme === 'dark' ? '/propely-dark.svg' : '/propely-light.svg';

  const handleResultClick = (url: string) => {
    router.push(url);
    setShowResults(false);
    setSearchQuery("");
    setShowMobileSearch(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-slate-800 dark:bg-[#181a1b]">
      <div className="flex h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu + Logo (Mobile Only) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={logoSrc}
              alt="Propely"
              width={70}
              height={30}
              className="h-7 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop Search with Dropdown */}
        <div className="hidden flex-1 max-w-md lg:block relative" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search properties, tenants, units..."
                className="pl-9 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              <div className="p-2 space-y-1">
                {searchResults.slice(0, 8).map((result) => {
                  const Icon = iconMap[result.type];
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result.url)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {result.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className="text-xs capitalize flex-shrink-0"
                            >
                              {result.type}
                            </Badge>
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          )}
                          {result.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {searchResults.length > 8 && (
                  <Link
                    href={`/dashboard/search?q=${encodeURIComponent(searchQuery)}`}
                    className="block px-3 py-2 text-sm text-center text-primary hover:bg-accent rounded-md"
                    onClick={() => {
                      setShowResults(false);
                      setSearchQuery("");
                    }}
                  >
                    View all {searchResults.length} results →
                  </Link>
                )}
              </div>
            </div>
          )}

          {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg p-4 z-50">
              <p className="text-sm text-muted-foreground text-center">
                No results found for &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            {showMobileSearch ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          {/* Quick Create Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2 hidden sm:flex">
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/properties/new" className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  New Property
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/tenants/new" className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Tenant
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/leases/new" className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Lease
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/maintenance/new" className="cursor-pointer">
                  <Wrench className="mr-2 h-4 w-4" />
                  Add Maintenance
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Urgent Items */}
          {totalUrgent > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hidden md:flex">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs"
                  >
                    {totalUrgent}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Urgent Items</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {urgentItems.maintenanceRequests && urgentItems.maintenanceRequests > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/maintenance?status=urgent" className="cursor-pointer">
                      <Wrench className="mr-2 h-4 w-4 text-red-500" />
                      <span className="flex-1">Maintenance Requests</span>
                      <Badge variant="destructive">{urgentItems.maintenanceRequests}</Badge>
                    </Link>
                  </DropdownMenuItem>
                )}
                {urgentItems.expiringLeases && urgentItems.expiringLeases > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/leases?status=expiring" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4 text-orange-500" />
                      <span className="flex-1">Expiring Leases</span>
                      <Badge variant="secondary">{urgentItems.expiringLeases}</Badge>
                    </Link>
                  </DropdownMenuItem>
                )}
                {urgentItems.overduePayments && urgentItems.overduePayments > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/payments?status=overdue" className="cursor-pointer">
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      <span className="flex-1">Overdue Payments</span>
                      <Badge variant="destructive">{urgentItems.overduePayments}</Badge>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            asChild
          >
            <Link href="/dashboard/help">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help</span>
            </Link>
          </Button>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationDropdown initialCount={unreadCount} />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full sm:w-auto sm:rounded-md sm:pl-2 sm:pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left text-sm sm:flex sm:ml-2">
                  <span className="font-medium">{user.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.role || "User"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {/* Mobile-only menu items */}
              <div className="md:hidden">
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/help" className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Theme
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={async () => {
                  await SignOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Expandable Section */}
      {showMobileSearch && (
        <div className="border-t px-4 py-3 lg:hidden animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}