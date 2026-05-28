import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAdmin } from "@/context/AdminContext";

export const Route = createFileRoute("/kasongo1/")({ component: AdminIndex });

function AdminIndex() {
  const { isAdmin } = useAdmin();
  return <Navigate to={isAdmin ? "/kasongo1/dashboard" : "/kasongo1/login"} />;
}
