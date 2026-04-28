import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";

export const Route = createFileRoute("/admin/")({ component: AdminIndex });

function AdminIndex() {
  const { isAdmin } = useAdmin();
  return <Navigate to={isAdmin ? "/admin/dashboard" : "/admin/login"} />;
}
