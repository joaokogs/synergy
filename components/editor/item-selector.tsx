"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBattleItems, getItemSpriteUrl, getItemData, type ItemInfo, type ItemDetail } from "@/lib/pokeapi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ItemSelectorProps {
  value: string | null;
  onChange: (item: string | null) => void;
}

function ItemOption({
  item,
  isSelected,
  onClick,
}: {
  item: ItemInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [detail, setDetail] = useState<ItemDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    getItemData(item.name).then((data) => {
      if (!cancelled && data) setDetail(data);
    });
    return () => { cancelled = true; };
  }, [item.name]);

  const content = (
    <>
      <img
        src={getItemSpriteUrl(item.name)}
        alt=""
        className="h-5 w-5 shrink-0 object-contain"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span className="text-pk-text-primary">{item.displayName}</span>
    </>
  );

  if (!detail) {
    return (
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-pk-sidebar-bg",
          isSelected && "bg-pk-sidebar-bg font-medium"
        )}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-pk-sidebar-bg",
              isSelected && "bg-pk-sidebar-bg font-medium"
            )}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            {content}
          </button>
        )}
        nativeButton
        openOnHover
        delay={300}
        closeDelay={200}
      />
      <PopoverContent
        side="right"
        align="center"
        sideOffset={8}
        className="w-72 [&[data-slot=popover-content]]:rounded-none"
      >
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <img src={getItemSpriteUrl(detail.name)} alt="" className="h-6 w-6 object-contain" />
          <p className="text-sm font-bold text-foreground">{detail.displayName}</p>
        </div>
        {detail.effect && (
          <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{detail.effect}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function ItemSelector({ value, onChange }: ItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ItemInfo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getBattleItems().then(setItems).catch(console.error);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items.slice(0, 50);
    const q = query.toLowerCase().trim();
    return items
      .filter((item) => item.name.includes(q) || item.displayName.toLowerCase().includes(q))
      .slice(0, 50);
  }, [query, items]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setQuery("");
    setOpen(isOpen);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const selectedItem = value
    ? items.find((i) => i.name === value) ?? {
        name: value,
        displayName: value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      }
    : null;

  const triggerContent = (
    <div className="flex flex-1">
      <PopoverTrigger
        className={cn(
          "flex h-8 flex-1 items-center gap-2 border px-3 text-sm transition-colors min-w-0 overflow-hidden",
          value
            ? "border-pk-border bg-pk-card-bg text-pk-text-primary"
            : "border-dashed border-pk-border bg-pk-card-bg text-pk-text-secondary hover:border-pk-text-primary",
          value && "border-r-0"
        )}
      >
        {selectedItem ? (
          <>
            <img
              src={getItemSpriteUrl(selectedItem.name)}
              alt=""
              className="h-5 w-5 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="truncate font-medium">{selectedItem.displayName}</span>
          </>
        ) : (
          <>
            <Search className="h-3.5 w-3.5" />
            <span>Item</span>
          </>
        )}
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0" />
      </PopoverTrigger>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-pk-border bg-pk-card-bg text-pk-text-secondary transition-colors hover:text-red-500"
          aria-label="Remove item"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {triggerContent}

      <PopoverContent
        className="w-(--anchor-width) min-w-[280px] overflow-hidden! p-0!"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-center border-b px-2">
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-pk-text-secondary" />
          <input
            ref={inputRef}
            placeholder="Search item..."
            className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-pk-text-secondary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto">
          {filtered.map((item) => (
            <ItemOption
              key={item.name}
              item={item}
              isSelected={value === item.name}
              onClick={() => { onChange(item.name); setOpen(false); }}
            />
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-center text-sm text-pk-text-secondary">
              No items found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
