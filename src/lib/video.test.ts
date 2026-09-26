import { describe, expect, it } from "vitest";
import { embedUrl, parseVideoUrl } from "./video";

describe("parseVideoUrl", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?si=abc",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/live/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "  https://youtu.be/dQw4w9WgXcQ  ",
  ])("detecta YouTube em %s", (url) => {
    expect(parseVideoUrl(url)).toEqual({ provider: "youtube", id: "dQw4w9WgXcQ" });
  });

  it.each([
    ["https://vimeo.com/76979871", { provider: "vimeo", id: "76979871" }],
    ["https://player.vimeo.com/video/76979871", { provider: "vimeo", id: "76979871" }],
    ["https://vimeo.com/channels/staffpicks/76979871", { provider: "vimeo", id: "76979871" }],
    ["https://vimeo.com/76979871/a1b2c3d4e5", { provider: "vimeo", id: "76979871", hash: "a1b2c3d4e5" }],
    [
      "https://player.vimeo.com/video/76979871?h=a1b2c3d4e5&badge=0",
      { provider: "vimeo", id: "76979871", hash: "a1b2c3d4e5" },
    ],
  ])("detecta Vimeo em %s", (url, expected) => {
    expect(parseVideoUrl(url)).toEqual(expected);
  });

  it.each([
    "",
    "não é url",
    "https://example.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=curto",
    "https://www.youtube.com/@canal",
    "https://vimeo.com/sobre",
    "javascript:alert(1)",
    "ftp://youtu.be/dQw4w9WgXcQ",
  ])("rejeita %j", (url) => {
    expect(parseVideoUrl(url)).toBeNull();
  });
});

describe("embedUrl", () => {
  it("usa o domínio sem cookies do YouTube", () => {
    expect(embedUrl({ provider: "youtube", id: "dQw4w9WgXcQ" })).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("inclui dnt e o hash de vídeos não listados do Vimeo", () => {
    expect(embedUrl({ provider: "vimeo", id: "1", hash: "abc123" })).toBe(
      "https://player.vimeo.com/video/1?dnt=1&h=abc123",
    );
    expect(embedUrl({ provider: "vimeo", id: "1" })).toBe("https://player.vimeo.com/video/1?dnt=1");
  });
});
