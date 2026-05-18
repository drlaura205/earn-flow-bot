import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import { AdminProvider } from "@/context/AdminContext";
import { LanguageProvider } from "@/context/LanguageContext";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0ea5e9" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "GIC" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "GIC — Global Investment Company" },
      { name: "description", content: "Earn USDT through tasks, AI trading and team referrals on the GIC platform." },
      { name: "author", content: "GIC" },
      { property: "og:title", content: "GIC — Global Investment Company" },
      { property: "og:description", content: "Earn USDT through tasks, AI trading and team referrals on the GIC platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "GIC — Global Investment Company" },
      { name: "twitter:description", content: "Earn USDT through tasks, AI trading and team referrals on the GIC platform." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/1MPrhDgPmnOOY928pQRe1AOT88b2/social-images/social-1777474121436-Gemini_Generated_Image_w7ae2yw7ae2yw7ae.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/1MPrhDgPmnOOY928pQRe1AOT88b2/social-images/social-1777474121436-Gemini_Generated_Image_w7ae2yw7ae2yw7ae.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/app-icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AdminProvider>
          <Outlet />
          <Toaster position="top-center" richColors />
        </AdminProvider>
      </AppProvider>
    </LanguageProvider>
  );
}
