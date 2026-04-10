import { cn } from "@/lib/utils";
import Image from "next/image";

interface BotanicalDecorProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "sidebar-bottom";
  className?: string;
}

const positionStyles: Record<BotanicalDecorProps["position"], string> = {
  "top-left": "absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 rotate-0",
  "top-right": "absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 rotate-90",
  "bottom-left": "absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 -rotate-90",
  "bottom-right": "absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 rotate-180",
  "sidebar-bottom": "absolute bottom-4 left-1/2 -translate-x-1/2 opacity-40",
};

const positionSvg: Record<BotanicalDecorProps["position"], string> = {
  "top-left": "/svg/leaf-1.svg",
  "top-right": "/svg/petal-1.svg",
  "bottom-left": "/svg/petal-1.svg",
  "bottom-right": "/svg/leaf-2.svg",
  "sidebar-bottom": "/svg/leaf-1.svg",
};

export function BotanicalDecor({ position, className }: BotanicalDecorProps) {
  return (
    <div
      className={cn("pointer-events-none select-none", positionStyles[position], className)}
      aria-hidden="true"
    >
      <Image src={positionSvg[position]} alt="" width={100} height={140} className="opacity-60" />
    </div>
  );
}
