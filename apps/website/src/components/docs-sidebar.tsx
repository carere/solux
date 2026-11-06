// Adapted from Zaidan src/components/docs-sidebar.tsx; see ../../ZAIDAN-NOTICE.md.
import { Link, useLocation } from "@tanstack/solid-router";
import { For } from "solid-js";
import { groupName, localizedPages, pageName } from "../content";
import * as m from "../paraglide/messages";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../registry/ui/sidebar";

const groups = ["Start here", "Core concepts", "In practice", "Resources"] as const;
export function DocsSidebar() {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar class="docs-sidebar">
      <SidebarContent class="docs-sidebar-content">
        <nav aria-label={m.documentation()}>
          <For each={groups}>
            {(group) => (
              <SidebarGroup>
                <SidebarGroupLabel>{groupName(group)}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <For each={localizedPages().filter((page) => page.group === group)}>
                      {(page) => (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            as={Link}
                            to="/docs/$slug"
                            // @ts-expect-error Kobalte's polymorphic wrapper cannot infer TanStack route params.
                            params={{ slug: page.slug }}
                            aria-current={
                              location().pathname === `/docs/${page.slug}` ||
                              (location().pathname === "/" && page.slug === "introduction")
                                ? "page"
                                : undefined
                            }
                            isActive={
                              location().pathname === `/docs/${page.slug}` ||
                              (location().pathname === "/" && page.slug === "introduction")
                            }
                            onClick={() => setOpenMobile(false)}
                          >
                            {pageName(page)}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </For>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </For>
        </nav>
        <div class="sidebar-footer">
          <p>
            {m.made_for()}
            <br />
            {m.release()}
          </p>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
