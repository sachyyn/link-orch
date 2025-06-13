'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"


interface BreadcrumbItemType {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

// Route mapping for breadcrumb generation
const ROUTE_MAP: Record<string, { title: string; parent?: string }> = {
  '/dashboard': { title: 'Dashboard' },
  '/content': { title: 'Content' },
  '/content/new': { title: 'New Post', parent: '/content' },
  '/ai-creator': { title: 'AI Creator' },
  '/analytics': { title: 'Analytics' },
  '/engagement': { title: 'Engagement' },
  '/leads': { title: 'Leads' },
  '/events': { title: 'Events' },
  '/calendar': { title: 'Calendar' },
  '/settings': { title: 'Settings' },
}

// Generate breadcrumbs from current pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItemType[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItemType[] = []
  
  // Always start with Dashboard as root if not on dashboard
  if (pathname !== '/dashboard') {
    breadcrumbs.push({
      title: 'Dashboard',
      href: '/dashboard'
    })
  }
  
  let currentPath = ''
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const isLast = i === segments.length - 1
    const routeConfig = ROUTE_MAP[currentPath]
    
    if (routeConfig) {
      breadcrumbs.push({
        title: routeConfig.title,
        href: isLast ? undefined : currentPath,
        isCurrentPage: isLast
      })
    } else {
      // Handle dynamic routes like /content/[id]/edit
      if (segments[i] === 'edit' && segments[i-1]) {
        breadcrumbs.push({
          title: 'Edit Content',
          isCurrentPage: isLast
        })
      } else if (segments[i-1] === 'content' && segments[i] !== 'new') {
        // Dynamic content ID
        breadcrumbs.push({
          title: 'Content Details',
          href: isLast ? undefined : currentPath,
          isCurrentPage: isLast
        })
      } else if (segments[i-1] === 'session' || segments[i-1] === 'project') {
        // AI Creator dynamic routes
        const type = segments[i-1] === 'session' ? 'Session' : 'Project'
        breadcrumbs.push({
          title: `${type} Details`,
          href: isLast ? undefined : currentPath,
          isCurrentPage: isLast
        })
      }
    }
  }
  
  return breadcrumbs
}

export function DashboardHeader() {
  const pathname = usePathname()
  
  // Generate breadcrumbs from current route
  const breadcrumbs = generateBreadcrumbs(pathname)
  
  // Get current page title - use prop title if provided, otherwise derive from breadcrumbs
  const currentPage = breadcrumbs[breadcrumbs.length - 1]
  
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col gap-1">
          {/* Breadcrumb Navigation - only show if we have more than one breadcrumb */}
          {breadcrumbs.length > 1 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <BreadcrumbItem key={index}>
                    {item.isCurrentPage ? (
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink asChild>
                          <Link href={item.href || '#'}>{item.title}</Link>
                        </BreadcrumbLink>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
      </div>
    </header>
  );
} 