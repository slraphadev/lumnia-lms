import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("remove acentos, pontuação e espaços", () => {
    expect(slugify("Introdução ao Design!")).toBe("introducao-ao-design");
    expect(slugify("  C++ & Rust: o básico  ")).toBe("c-rust-o-basico");
  });

  it("limita o tamanho sem deixar hífen no fim", () => {
    const slug = slugify("a ".repeat(100));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("devolve vazio quando não sobra nada", () => {
    expect(slugify("!!!")).toBe("");
  });
});
