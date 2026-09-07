import {
  CalendarDots,
  Gear,
  House,
  ListChecks,
  Lightning,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";

export type NavItem = { href: string; label: string; icon: Icon };

export const NAV: NavItem[] = [
  { href: "/app", label: "Home", icon: House },
  { href: "/app/planner", label: "Jadwal", icon: CalendarDots },
  { href: "/app/aktivitas", label: "Aktivitas", icon: ListChecks },
  { href: "/app/rumah", label: "Rumah", icon: Lightning },
  { href: "/app/komunitas", label: "Komunitas", icon: UsersThree },
];

export const SETTINGS: NavItem = {
  href: "/app/pengaturan",
  label: "Pengaturan",
  icon: Gear,
};

export const RAIL_OPEN = 268;
export const RAIL_CLOSED = 84;

export const EASE = [0.32, 0.72, 0, 1] as const;

export const RAIL_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 42,
  mass: 0.9,
} as const;

export const PILL_SPRING = {
  type: "spring",
  stiffness: 520,
  damping: 44,
  mass: 0.7,
} as const;

export const isActive = (pathname: string, href: string) =>
  href === "/app"
    ? pathname === "/app"
    : pathname === href || pathname.startsWith(`${href}/`);
