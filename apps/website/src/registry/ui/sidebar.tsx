// Adapted from Zaidan (MIT, Copyright (c) 2025 Kevin Abatan). See ../../../ZAIDAN-NOTICE.md.
import { Polymorphic, type PolymorphicProps } from "@kobalte/core/polymorphic";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft } from "lucide-solid";
import {
  type Accessor,
  type Component,
  type ComponentProps,
  createContext,
  createEffect,
  createSignal,
  type JSX,
  Match,
  mergeProps,
  onCleanup,
  Switch,
  splitProps,
  useContext,
  type ValidComponent,
} from "solid-js";
import { cn } from "../../lib/utils";
import * as m from "../../paraglide/messages";
import { useIsMobile } from "../hooks/use-mobile";
import { Button, type ButtonProps } from "./button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: Accessor<"expanded" | "collapsed">;
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  openMobile: Accessor<boolean>;
  setOpenMobile: (open: boolean) => void;
  isMobile: Accessor<boolean>;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

type SidebarProviderProps = ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SidebarProvider = (props: SidebarProviderProps) => {
  const mergedProps = mergeProps({ defaultOpen: true }, props);
  const [local, others] = splitProps(mergedProps, [
    "defaultOpen",
    "open",
    "onOpenChange",
    "class",
    "style",
    "children",
  ]);

  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = createSignal(false);

  // This is the internal state of the sidebar.
  // We use open and onOpenChange for control from outside the component.
  const [_open, _setOpen] = createSignal(local.defaultOpen);
  const open = () => local.open ?? _open();
  const setOpen = (value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open()) : value;

    if (local.onOpenChange) {
      local.onOpenChange(openState);
    } else {
      _setOpen(openState);
    }

    // This sets the cookie to keep the sidebar state.
    // biome-ignore lint/suspicious/noDocumentCookie: <waiting for better solution>
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  // Helper to toggle the sidebar.
  const toggleSidebar = () => {
    return isMobile() ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  };

  // Adds a keyboard shortcut to toggle the sidebar.
  createEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = () => (open() ? "expanded" : "collapsed");

  const contextValue = {
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...(local.style as JSX.CSSProperties),
        }}
        class={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
          local.class,
        )}
        {...others}
      >
        {local.children}
      </div>
    </SidebarContext.Provider>
  );
};

type SidebarProps = ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
};

const Sidebar: Component<SidebarProps> = (props) => {
  const mergedProps = mergeProps<SidebarProps[]>(
    {
      side: "left",
      variant: "sidebar",
      collapsible: "offcanvas",
    },
    props,
  );
  const [local, others] = splitProps(mergedProps, [
    "side",
    "variant",
    "collapsible",
    "class",
    "children",
  ]);

  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  return (
    <Switch>
      <Match when={local.collapsible === "none"}>
        <div
          class={cn(
            "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
            local.class,
          )}
          data-slot="sidebar"
          {...others}
        >
          {local.children}
        </div>
      </Match>
      <Match when={isMobile()}>
        <Sheet onOpenChange={setOpenMobile} open={openMobile()} {...others}>
          <SheetContent
            onCloseAutoFocus={(event) => {
              // The sidebar trigger lives outside the Sheet root. Restore it on
              // dismissal, while preserving a route's explicit main-content focus.
              event.preventDefault();
              if (!document.activeElement?.closest("main")) {
                document.querySelector<HTMLButtonElement>('[data-slot="sidebar-trigger"]')?.focus();
              }
            }}
            class="docs-mobile-sheet w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground "
            data-mobile="true"
            data-sidebar="sidebar"
            data-slot="sidebar"
            side={local.side}
            style={{
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            }}
          >
            <SheetHeader class="sr-only">
              <SheetTitle>{m.documentation()}</SheetTitle>
              <SheetDescription>{m.mobile_navigation()}</SheetDescription>
            </SheetHeader>
            <div class="flex size-full flex-col">{local.children}</div>
          </SheetContent>
        </Sheet>
      </Match>
      <Match when={!isMobile()}>
        <div
          class="group peer hidden text-sidebar-foreground md:block"
          data-state={state()}
          data-collapsible={state() === "collapsed" ? local.collapsible : ""}
          data-variant={local.variant}
          data-side={local.side}
          data-slot="sidebar"
        >
          {/* This is what handles the sidebar gap on desktop */}
          <div
            data-slot="sidebar-gap"
            class={cn(
              "z-sidebar-gap relative w-(--sidebar-width) bg-transparent",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              local.variant === "floating" || local.variant === "inset"
                ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
            )}
          />
          <div
            data-slot="sidebar-container"
            data-side={local.side}
            class={cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:-left-(--sidebar-width) data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:-right-(--sidebar-width) md:flex",
              // Adjust the padding for floating and inset variants.
              local.variant === "floating" || local.variant === "inset"
                ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              local.class,
            )}
            {...others}
          >
            <div
              data-sidebar="sidebar"
              data-slot="sidebar-inner"
              class="z-sidebar-inner flex size-full flex-col"
            >
              {local.children}
            </div>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

type SidebarTriggerProps = ButtonProps;

const SidebarTrigger = (props: SidebarTriggerProps) => {
  const [local, others] = splitProps(props, ["class", "onClick"]);
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <Button
      aria-label={openMobile() ? m.close_menu() : m.menu()}
      aria-expanded={openMobile()}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      class={cn("z-sidebar-trigger", local.class)}
      onClick={(event: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => {
        const handler = local.onClick as
          | JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>
          | undefined;
        if (typeof handler === "function") handler(event);
        else handler?.[0](handler[1], event);
        toggleSidebar();
      }}
      {...others}
    >
      <PanelLeft />
      <span class="sr-only">{openMobile() ? m.close_menu() : m.menu()}</span>
    </Button>
  );
};

const SidebarContent = (props: ComponentProps<"div">) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      class={cn(
        "z-sidebar-content flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        local.class,
      )}
      {...others}
    />
  );
};

const SidebarGroup = (props: ComponentProps<"div">) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      class={cn("relative z-sidebar-group flex w-full min-w-0 flex-col", local.class)}
      {...others}
    />
  );
};

type SidebarGroupLabelProps<T extends ValidComponent = "div"> = PolymorphicProps<
  T,
  ComponentProps<T>
>;

const SidebarGroupLabel = <T extends ValidComponent = "div">(props: SidebarGroupLabelProps<T>) => {
  const [local, others] = splitProps(props as SidebarGroupLabelProps, ["class"]);

  return (
    <Polymorphic<SidebarGroupLabelProps>
      as="div"
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      class={cn(
        "z-sidebar-group-label flex shrink-0 items-center outline-hidden [&>svg]:shrink-0",
        local.class,
      )}
      {...others}
    />
  );
};

const SidebarGroupContent = (props: ComponentProps<"div">) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      class={cn("z-sidebar-group-content w-full", local.class)}
      {...others}
    />
  );
};

const SidebarMenu = (props: ComponentProps<"ul">) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      class={cn("z-sidebar-menu flex w-full min-w-0 flex-col", local.class)}
      {...others}
    />
  );
};

const SidebarMenuItem = (props: ComponentProps<"li">) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      class={cn("group/menu-item relative", local.class)}
      {...others}
    />
  );
};

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button z-sidebar-menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "z-sidebar-menu-button-variant-default",
        outline: "z-sidebar-menu-button-variant-outline",
      },
      size: {
        default: "z-sidebar-menu-button-size-default",
        sm: "z-sidebar-menu-button-size-sm",
        lg: "z-sidebar-menu-button-size-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type SidebarMenuButtonProps<T extends ValidComponent = "button"> = PolymorphicProps<
  T,
  Pick<ComponentProps<T>, "class" | "children">
> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    isActive?: boolean;
  };

const SidebarMenuButton = <T extends ValidComponent = "button">(
  rawProps: SidebarMenuButtonProps<T>,
) => {
  const props = mergeProps({ isActive: false, variant: "default", size: "default" }, rawProps);
  const [local, others] = splitProps(props as SidebarMenuButtonProps, [
    "isActive",
    "variant",
    "size",
    "class",
  ]);
  const MenuButton = (props: SidebarMenuButtonProps) => {
    const [_local, _others] = splitProps(props as SidebarMenuButtonProps, ["class"]);
    return (
      <Polymorphic<SidebarMenuButtonProps>
        as="button"
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        data-size={local.size}
        data-active={local.isActive ? "true" : undefined}
        class={cn(
          sidebarMenuButtonVariants({ variant: local.variant, size: local.size }),
          _local.class,
          local.class,
        )}
        {..._others}
        {...others}
      />
    );
  };

  return <MenuButton />;
};

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
