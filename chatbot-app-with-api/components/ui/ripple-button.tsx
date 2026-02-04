"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RippleButtonProps extends React.ComponentProps<typeof Button> {
  rippleColor?: string;
}

export function RippleButton({
  children,
  className,
  rippleColor = "rgba(255, 255, 255, 0.6)",
  onClick,
  ...props
}: RippleButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.background = `radial-gradient(circle, ${rippleColor} 0%, ${rippleColor.replace("0.6", "0.3")} 40%, transparent 70%)`;
    ripple.className = "ripple";

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    onClick?.(event);
  };

  return (
    <Button
      ref={buttonRef}
      className={cn("ripple-container", className)}
      onClick={createRipple}
      {...props}
    >
      {children}
    </Button>
  );
}
