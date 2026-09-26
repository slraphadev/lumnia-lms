import type { CSSProperties } from "react";

const LOGOS = {
  full: { src: "/brand/lumnia-full.svg", ratio: 5853 / 2437 },
  simple: { src: "/brand/lumnia-simple.svg", ratio: 1394 / 1241 },
  minimal: { src: "/brand/lumnia-minimal.svg", ratio: 1081 / 1097 },
} as const;

type LogoProps = {
  type?: keyof typeof LOGOS;
  /** Altura em px. A Full não deve ficar abaixo de 96px de largura. */
  height?: number;
  className?: string;
};

/**
 * Logo em máscara CSS: a cor vem do `color` atual (Brand, Ink ou White conforme o fundo).
 */
export function Logo({ type = "full", height = 40, className = "text-brand-text" }: LogoProps) {
  const { src, ratio } = LOGOS[type];
  const style: CSSProperties = {
    height,
    width: Math.round(height * ratio),
    backgroundColor: "currentColor",
    maskImage: `url(${src})`,
    maskSize: "contain",
    maskRepeat: "no-repeat",
    maskPosition: "center",
  };
  return <span role="img" aria-label="Lumnia" className={`inline-block shrink-0 ${className}`} style={style} />;
}
