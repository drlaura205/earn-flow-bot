import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title, gradient = true }: { title: string; gradient?: boolean }) {
  return (
    <div className={`relative px-5 pt-12 pb-6 ${gradient ? "bg-hero-gradient text-white rounded-b-[2rem]" : ""}`}>
      <Link to="/account" className="absolute top-12 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
        <ChevronLeft size={20} />
      </Link>
      <h1 className="text-center text-lg font-bold">{title}</h1>
    </div>
  );
}

export const Route = createFileRoute("/_unused")({
  component: () => null as ReactNode,
});
