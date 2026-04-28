import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthed } = useApp();
  return <Navigate to={isAuthed ? "/home" : "/login"} />;
}
