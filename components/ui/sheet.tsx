"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"

import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/20 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "left",
  showCloseButton = true,
  ...props
}: DrawerPrimitive.Popup.Props & {
  side?: "left" | "right" | "top" | "bottom"
  showCloseButton?: boolean
}) {
  const sideClasses = {
    left: "left-0 top-0 h-full w-72 max-w-[calc(100vw-2rem)]",
    right: "right-0 top-0 h-full w-72 max-w-[calc(100vw-2rem)]",
    top: "top-0 left-0 w-full h-72 max-h-[calc(100vh-2rem)]",
    bottom: "bottom-0 left-0 w-full h-72 max-h-[calc(100vh-2rem)]",
  }

  const animateClasses = {
    left: "data-open:animate-in data-open:slide-in-from-left-full data-closed:animate-out data-closed:slide-out-to-left-full",
    right: "data-open:animate-in data-open:slide-in-from-right-full data-closed:animate-out data-closed:slide-out-to-right-full",
    top: "data-open:animate-in data-open:slide-in-from-top-full data-closed:animate-out data-closed:slide-out-to-top-full",
    bottom: "data-open:animate-in data-open:slide-in-from-bottom-full data-closed:animate-out data-closed:slide-out-to-bottom-full",
  }

  return (
    <SheetPortal>
      <SheetOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 isolate pointer-events-none">
        <DrawerPrimitive.Popup
          data-slot="sheet-content"
          className={cn(
            "fixed z-50 bg-popover text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none pointer-events-auto",
            "flex flex-col",
            sideClasses[side],
            animateClasses[side],
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DrawerPrimitive.Close
              data-slot="sheet-close"
              className="absolute top-3 right-3"
              render={<button type="button" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" />}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DrawerPrimitive.Close>
          )}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 px-6 py-5", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
