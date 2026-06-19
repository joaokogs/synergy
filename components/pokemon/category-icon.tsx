import { cn } from "@/lib/utils";
import type { MoveCategory } from "@/lib/pokeapi";

interface CategoryIconProps {
  category: MoveCategory;
  size?: number;
  className?: string;
}

const CATEGORY_STYLES: Record<
  MoveCategory,
  { label: string; color: string; bg: string }
> = {
  physical: {
    label: "Phy",
    color: "#f97316",
    bg: "#fff7ed",
  },
  special: {
    label: "Spc",
    color: "#1d4ed8",
    bg: "#eff6ff",
  },
  status: {
    label: "Sta",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
};

export function CategoryIcon({
  category,
  className = "",
}: CategoryIconProps) {
  const style = CATEGORY_STYLES[category];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold uppercase leading-none",
        className
      )}
      style={{
        color: style.color,
        backgroundColor: style.bg,
      }}
    >
      {style.label}
    </span>
  );
}

export function getCategoryStyle(category: MoveCategory) {
  return CATEGORY_STYLES[category];
}
