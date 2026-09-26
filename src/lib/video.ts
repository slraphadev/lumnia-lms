export type VideoProvider = "youtube" | "vimeo";

export type ParsedVideo = {
  provider: VideoProvider;
  id: string;
  /** Hash de privacidade de vídeos não listados do Vimeo. */
  hash?: string;
};

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const VIMEO_HASH = /^[0-9a-f]{6,}$/i;

/**
 * Detecta um link do YouTube ou do Vimeo. Retorna null para qualquer outra coisa.
 */
export function parseVideoUrl(input: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    return youtube(parts[0]);
  }
  if (YOUTUBE_HOSTS.has(host)) {
    if (parts[0] === "watch") return youtube(url.searchParams.get("v"));
    if (["embed", "shorts", "live", "v"].includes(parts[0])) return youtube(parts[1]);
    return null;
  }
  if (VIMEO_HOSTS.has(host)) {
    // player.vimeo.com/video/123?h=abc | vimeo.com/123/abc | vimeo.com/channels/x/123
    const idIndex = parts.findIndex((p) => /^\d+$/.test(p));
    if (idIndex === -1) return null;
    const id = parts[idIndex];
    const hash = url.searchParams.get("h") ?? parts[idIndex + 1];
    return hash && VIMEO_HASH.test(hash) ? { provider: "vimeo", id, hash } : { provider: "vimeo", id };
  }
  return null;
}

function youtube(id: string | null | undefined): ParsedVideo | null {
  return id && YOUTUBE_ID.test(id) ? { provider: "youtube", id } : null;
}

/** URL do player embutido, nas variantes que não rastreiam o visitante. */
export function embedUrl(video: ParsedVideo): string {
  if (video.provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${video.id}`;
  }
  const params = new URLSearchParams({ dnt: "1" });
  if (video.hash) params.set("h", video.hash);
  return `https://player.vimeo.com/video/${video.id}?${params}`;
}
