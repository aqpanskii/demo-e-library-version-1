"use client";

/**
 * @author: @dorianbaffier
 * @description: Particle Button
 * @version: 1.1.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { MousePointerClick } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
const Button = "button";
const cn = (...values: (string | undefined)[]) => values.filter(Boolean).join(" ");

export interface ParticleButtonProps extends ComponentProps<typeof Button> {
  /** Called after a click that was not `preventDefault()`-ed, alongside the burst. */
  onSuccess?: () => void;
  /** How long (ms) the particle layer stays mounted after a click. */
  successDuration?: number;
  /** Icon rendered after the label. Pass `null` to hide it. */
  icon?: ReactNode;
}

interface Particle {
  x: number;
  y: number;
}

interface Burst {
  id: number;
  particles: Particle[];
}

const PARTICLE_COUNT = 6;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: (i % 2 ? 1 : -1) * (Math.random() * 40 + 16),
    y: -(Math.random() * 36 + 16),
  }));
}

function SuccessParticles({ particles }: { particles: Particle[] }) {
  return (
    <span
      aria-hidden="true"
      className="particle-layer"
    >
      {particles.map((particle, i) => (
        <motion.span
          animate={{
            opacity: [1, 1, 0],
            scale: [0.5, 1, 0.6],
            x: particle.x,
            y: particle.y,
          }}
          className="particle-dot"
          initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
          // biome-ignore lint/suspicious/noArrayIndexKey: particles are a fixed-size, never-reordered list
          key={i}
          transition={{
            duration: 0.45,
            delay: i * 0.02,
            ease: EASE_OUT,
          }}
        />
      ))}
    </span>
  );
}

export default function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 600,
  icon = <MousePointerClick className="h-4 w-4" />,
  className,
  ...props
}: ParticleButtonProps) {
  const [burst, setBurst] = useState<Burst | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstIdRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) {
      return;
    }

    if (!shouldReduceMotion) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      burstIdRef.current += 1;
      // A new id remounts the particles so rapid re-clicks restart the burst.
      setBurst({ id: burstIdRef.current, particles: createParticles() });
      timeoutRef.current = setTimeout(() => {
        setBurst(null);
        timeoutRef.current = null;
      }, successDuration);
    }

    onSuccess?.();
  };

  return (
    <span className="particle-wrap">
      {burst && <SuccessParticles key={burst.id} particles={burst.particles} />}
      <Button
        className={cn(
          "particle-trigger",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        {icon}
      </Button>
    </span>
  );
}
