// "use client"

// import * as React from "react"
// import { Drawer as DrawerPrimitive } from "vaul"

// import { cn } from "@/lib/utils"

// function Drawer({
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
//   return <DrawerPrimitive.Root data-slot="drawer" {...props} />
// }

// function DrawerTrigger({
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
//   return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
// }

// function DrawerPortal({
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
//   return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
// }

// function DrawerClose({
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
//   return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
// }

// function DrawerOverlay({
//   className,
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
//   return (
//     <DrawerPrimitive.Overlay
//       data-slot="drawer-overlay"
//       className={cn(
//         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// function DrawerContent({
//   className,
//   children,
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
//   return (
//     <DrawerPortal data-slot="drawer-portal">
//       <DrawerOverlay />
//       <DrawerPrimitive.Content
//         data-slot="drawer-content"
//         className={cn(
//           "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
//           "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
//           "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
//           "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
//           "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
//           className
//         )}
//         {...props}
//       >
//         <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
//         {children}
//       </DrawerPrimitive.Content>
//     </DrawerPortal>
//   )
// }

// function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="drawer-header"
//       className={cn(
//         "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="drawer-footer"
//       className={cn("mt-auto flex flex-col gap-2 p-4", className)}
//       {...props}
//     />
//   )
// }

// function DrawerTitle({
//   className,
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
//   return (
//     <DrawerPrimitive.Title
//       data-slot="drawer-title"
//       className={cn("text-foreground font-semibold", className)}
//       {...props}
//     />
//   )
// }

// function DrawerDescription({
//   className,
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
//   return (
//     <DrawerPrimitive.Description
//       data-slot="drawer-description"
//       className={cn("text-muted-foreground text-sm", className)}
//       {...props}
//     />
//   )
// }

// export {
//   Drawer,
//   DrawerPortal,
//   DrawerOverlay,
//   DrawerTrigger,
//   DrawerClose,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerDescription,
// }



"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

type DrawerTriggerProps = React.ComponentProps<
  typeof DrawerPrimitive.Trigger
> & {
  asChild?: boolean
}

function DrawerTrigger({
  asChild = false,
  children,
  ...props
}: DrawerTriggerProps) {
  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        "DrawerTrigger with asChild requires a single React element."
      )
    }

    return (
      <DrawerPrimitive.Trigger
        data-slot="drawer-trigger"
        render={children}
        {...props}
      />
    )
  }

  return (
    <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props}>
      {children}
    </DrawerPrimitive.Trigger>
  )
}

function DrawerPortal(
  props: React.ComponentProps<typeof DrawerPrimitive.Portal>
) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]",
        "transition-opacity duration-200",
        "data-[open]:opacity-100 data-[closed]:opacity-0",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function DrawerViewport({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Viewport>) {
  return (
    <DrawerPrimitive.Viewport
      data-slot="drawer-viewport"
      className={cn("pointer-events-none fixed inset-0 z-50", className)}
      {...props}
    />
  )
}

type DrawerSide = "top" | "right" | "bottom" | "left"

type DrawerContentProps = React.ComponentProps<
  typeof DrawerPrimitive.Popup
> & {
  side?: DrawerSide
  showHandle?: boolean
  showCloseButton?: boolean
  overlayClassName?: string
  viewportClassName?: string
}

function DrawerContent({
  className,
  children,
  side = "bottom",
  showHandle = side === "bottom" || side === "top",
  showCloseButton = false,
  overlayClassName,
  viewportClassName,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerOverlay className={overlayClassName} />

      <DrawerViewport
        className={cn(
          side === "bottom" && "flex items-end justify-center",
          side === "top" && "flex items-start justify-center",
          side === "left" && "flex items-stretch justify-start",
          side === "right" && "flex items-stretch justify-end",
          viewportClassName
        )}
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          data-side={side}
          className={cn(
            "pointer-events-auto relative flex flex-col border bg-background text-foreground shadow-2xl outline-none",
            "transition duration-300 ease-out",
            "data-[open]:translate-x-0 data-[open]:translate-y-0 data-[open]:opacity-100",
            "data-[closed]:opacity-0",
            side === "bottom" &&
              "max-h-[92vh] w-full rounded-t-2xl border-x border-t data-[closed]:translate-y-full data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
            side === "top" &&
              "max-h-[92vh] w-full rounded-b-2xl border-x border-b data-[closed]:-translate-y-full data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
            side === "left" &&
              "h-full w-[min(88vw,24rem)] border-r data-[closed]:-translate-x-full data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
            side === "right" &&
              "h-full w-[min(88vw,24rem)] border-l data-[closed]:translate-x-full data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
            className
          )}
          {...props}
        >
          {showHandle && (
            <div
              data-slot="drawer-handle"
              aria-hidden="true"
              className={cn(
                "mx-auto my-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25",
                side === "top" && "order-last"
              )}
            />
          )}

          {showCloseButton && (
            <DrawerClose
              aria-label="Close drawer"
              className="absolute right-4 top-4 z-10"
            />
          )}

          {children}
        </DrawerPrimitive.Popup>
      </DrawerViewport>
    </DrawerPortal>
  )
}

function DrawerBody({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Content
      data-slot="drawer-body"
      className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)}
      {...props}
    />
  )
}

function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "grid gap-1.5 px-6 pt-5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "mt-auto flex flex-col-reverse gap-3 border-t px-6 py-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  )
}

function DrawerClose({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg",
        "text-muted-foreground transition hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {children ?? <X className="size-4" />}
    </DrawerPrimitive.Close>
  )
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
}