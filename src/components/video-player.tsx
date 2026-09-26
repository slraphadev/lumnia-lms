import { embedUrl, type VideoProvider } from "@/lib/video";

export function VideoPlayer({ provider, id, hash, title }: { provider: VideoProvider; id: string; hash?: string; title: string }) {
  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-inverse">
      <iframe
        src={embedUrl({ provider, id, hash })}
        title={title}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
