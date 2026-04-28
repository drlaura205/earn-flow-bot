import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title, gradient = true, back = "/account" }: { title: string; gradient?: boolean; back?: string }) {
  return (
    <div className={`relative px-5 pt-12 pb-6 ${gradient ? "bg-hero-gradient text-white rounded-b-[2rem]" : "text-foreground"}`}>
      <Link to={back as any} className={`absolute top-12 left-3 flex h-9 w-9 items-center justify-center rounded-full ${gradient ? "bg-white/15 backdrop-blur-sm" : "bg-card shadow-card"}`}>
        <ChevronLeft size={20} />
      </Link>
      <h1 className="text-center text-lg font-bold">{title}</h1>
    </div>
  );
}
