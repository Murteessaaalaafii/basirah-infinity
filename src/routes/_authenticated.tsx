import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { waitForAuth } from "@/integrations/firebase/helpers";

export const Route = createFileRoute("/_authenticated")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow, noarchive" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const user = await waitForAuth();
    if (!user) throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
