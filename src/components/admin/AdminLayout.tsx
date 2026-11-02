import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag01Icon, File01Icon, Tag01Icon, Mail01Icon, UserGroupIcon, Logout03Icon, SidebarLeftIcon, SidebarRightIcon } from "hugeicons-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, useSidebar } from "@/components/ui/sidebar";

const navItems = [{
  title: "Orders",
  url: "/admin/orders",
  icon: ShoppingBag01Icon
}, {
  title: "Posts",
  url: "/admin/posts",
  icon: File01Icon
}, {
  title: "Categories",
  url: "/admin/categories",
  icon: Tag01Icon
}, {
  title: "Users",
  url: "/admin/users",
  icon: UserGroupIcon
}, {
  title: "Messages",
  url: "/admin/messages",
  icon: Mail01Icon
}];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const FloatingTrigger = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  // On phones the sidebar is a drawer, so the trigger must always be shown
  if (!isMobile && state === "expanded") return null;
  
  return (
    <button
      onClick={toggleSidebar}
      aria-label="Open sidebar"
      className="fixed left-4 top-6 z-50 w-10 h-10 rounded-lg bg-background border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
    >
      <SidebarRightIcon className="w-[18px] h-[18px]" />
    </button>
  );
};

const SidebarToggle = () => {
  const { state, toggleSidebar } = useSidebar();
  
  if (state === "collapsed") return null;
  
  return (
    <button
      onClick={toggleSidebar}
      aria-label="Collapse sidebar"
      className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
    >
      <SidebarLeftIcon className="w-[18px] h-[18px]" />
    </button>
  );
};

const AdminLayoutContent = ({
  children,
  title,
  description
}: AdminLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "A";
  const userName = "Admin";

  return (
    <div className="h-dvh flex w-full bg-background overflow-hidden">
      <Sidebar className="border-r border-border bg-background">
        <nav aria-label="Admin" className="flex h-full min-h-0 flex-col">
        {/* Logo Header */}
        <SidebarHeader className="p-6 pb-8 flex flex-row items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-[17px] font-semibold text-foreground whitespace-nowrap">Agente Registrado <span className="text-lime">Florida</span></span>
          </Link>
          <SidebarToggle />
        </SidebarHeader>

        <SidebarContent className="px-3">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground text-sm font-normal px-3 mb-1">
              Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navItems.map(item => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} className={`h-11 px-3 rounded-lg transition-all ${isActive ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                        <Link to={item.url} onClick={() => setOpenMobile(false)} className="flex items-center gap-3">
                          <item.icon className="w-[18px] h-[18px]" />
                          <span className="text-base">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User Footer */}
        <SidebarFooter className="p-3 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-semibold text-base">
                {userInitial}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            
            {/* Logout Button */}
            <button onClick={signOut} aria-label="Log out" className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Logout">
              <Logout03Icon className="w-[18px] h-[18px]" />
            </button>
          </div>
        </SidebarFooter>
        </nav>
      </Sidebar>

      <FloatingTrigger />

      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col h-dvh overflow-hidden">
        <header className="shrink-0 pt-6 pb-4 px-6 bg-background">
          <div className={state === "collapsed" || isMobile ? "pl-12" : ""}>
            <h1 className="font-medium text-[28px] leading-tight">{title}</h1>
            {description && <p className="text-[14px] text-muted-foreground">{description}</p>}
          </div>
        </header>

        <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }} className="flex-1 overflow-auto px-6 pb-6">
          {children}
        </motion.div>
      </main>
    </div>
  );
};

const AdminLayout = (props: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <AdminLayoutContent {...props} />
    </SidebarProvider>
  );
};

export default AdminLayout;