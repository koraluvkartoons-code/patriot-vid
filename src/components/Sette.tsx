import { ChangeEvent, useMemo, useRef, useState } from "react";

type MediaPost = {
  id: number;
  type: "photo" | "video" | "text";
  url?: string;
  text?: string;
  title: string;
};

const initialPosts: MediaPost[] = [];

export default function Sette() {
  const [cassetteImage, setCassetteImage] = useState<string>("");
  const [cassetteColor, setCassetteColor] = useState("#24112f");
  const [cassetteName, setCassetteName] = useState("MY SETTE");
  const [posts, setPosts] = useState<MediaPost[]>(initialPosts);
  const [newText, setNewText] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const cassetteInput = useRef<HTMLInputElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);

  const cassetteStyle = useMemo(
    () => ({
      backgroundColor: cassetteColor,
      boxShadow: `0 0 25px ${cassetteColor}88, inset 0 0 35px #00000066`,
    }),
    [cassetteColor]
  );

  function uploadCassetteImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setCassetteImage(String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  function uploadPostMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");

    setPosts((current) => [
      ...current,
      {
        id: Date.now(),
        type: isVideo ? "video" : "photo",
        url,
        title: newTitle || file.name,
      },
    ]);

    setNewTitle("");
    event.target.value = "";
  }

  function addTextPost() {
    if (!newText.trim()) return;

    setPosts((current) => [
      ...current,
      {
        id: Date.now(),
        type: "text",
        text: newText,
        title: newTitle || "SETTE POST",
      },
    ]);

    setNewText("");
    setNewTitle("");
  }

  return (
    <main className="min-h-screen bg-[#09050d] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.45em] text-purple-300">
            PATRIOT.VID
          </p>

          <h1 className="text-4xl font-black tracking-widest text-purple-100 sm:text-6xl">
            SETTE
          </h1>

          <p className="mt-3 text-sm text-purple-300">
            CUSTOM MEDIA • CASSETTES • CDS • POSTS
          </p>
        </header>

        <section className="mb-12 rounded-3xl border border-purple-900/70 bg-[#110817] p-5 shadow-2xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-wider">
              CREATE YOUR SETTE
            </h2>

            <p className="mt-2 text-sm text-purple-300">
              Upload any photo and turn it into the artwork for your cassette.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              <label className="mb-2 block text-sm font-bold text-purple-200">
                Cassette name
              </label>

              <input
                value={cassetteName}
                onChange={(e) => setCassetteName(e.target.value)}
                className="mb-5 w-full rounded-xl border border-purple-800 bg-black/40 px-4 py-3 outline-none focus:border-purple-400"
                placeholder="MY SETTE"
              />

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => cassetteInput.current?.click()}
                  className="rounded-xl bg-purple-700 px-5 py-3 font-bold hover:bg-purple-600"
                >
                  UPLOAD CASSETTE PHOTO
                </button>

                <input
                  ref={cassetteInput}
                  type="file"
                  accept="image/*"
                  onChange={uploadCassetteImage}
                  className="hidden"
                />

                <label className="flex items-center gap-3 rounded-xl border border-purple-800 bg-black/30 px-4 py-3">
                  <span className="text-sm font-bold">CASSETTE COLOR</span>

                  <input
                    type="color"
                    value={cassetteColor}
                    onChange={(e) => setCassetteColor(e.target.value)}
                    className="h-9 w-14 cursor-pointer bg-transparent"
                  />
                </label>
              </div>

              <div
                className="relative mx-auto aspect-[1.75/1] max-w-2xl overflow-hidden rounded-[28px] border-4 border-black"
                style={cassetteStyle}
              >
                {cassetteImage && (
                  <img
                    src={cassetteImage}
                    alt="Custom cassette artwork"
                    className="absolute inset-0 h-full w-full object-cover opacity-75"
                  />
                )}

                <div className="absolute inset-0 bg-black/20" />

                <div className="absolute left-[8%] top-[16%] right-[8%] bottom-[16%] rounded-xl border-2 border-black/70 bg-black/35">
                  <div className="absolute left-[12%] right-[12%] top-1/2 h-8 -translate-y-1/2 rounded-full bg-black/80">
                    <div className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white/20" />
                    <div className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white/20" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/70 px-4 py-1 text-xs font-black tracking-[0.3em]">
                  {cassetteName}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-900 bg-black/30 p-5">
              <h3 className="mb-4 text-lg font-black">
                ADD TO SETTE
              </h3>

              <p className="mb-5 text-sm text-purple-300">
                Add photos, videos, or text posts. Video posts are displayed
                as playable media.
              </p>

              <input
                ref={mediaInput}
                type="file"
                accept="image/*,video/*"
                onChange={uploadPostMedia}
                className="mb-4 block w-full text-sm"
              />

              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Post title"
                className="mb-3 w-full rounded-xl border border-purple-800 bg-black/50 px-4 py-3 outline-none"
              />

              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Write a text post..."
                rows={5}
                className="mb-3 w-full rounded-xl border border-purple-800 bg-black/50 px-4 py-3 outline-none"
              />

              <button
                onClick={addTextPost}
                className="w-full rounded-xl bg-purple-700 px-4 py-3 font-black hover:bg-purple-600"
              >
                ADD TEXT POST
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.35em] text-purple-400">
                MEDIA PLAYER
              </p>

              <h2 className="mt-1 text-3xl font-black">
                ALL SETTE POSTS
              </h2>
            </div>

            <span className="rounded-full border border-purple-800 px-3 py-1 text-xs font-bold text-purple-300">
              {posts.length} POSTS
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-purple-800 bg-[#110817] p-12 text-center">
              <div className="mx-auto mb-4 text-5xl">📼</div>

              <h3 className="text-xl font-black">
                NO MEDIA YET
              </h3>

              <p className="mt-2 text-sm text-purple-400">
                Upload a photo or video above to create your first SETTE.
              </p>
            </div>
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group overflow-hidden rounded-3xl border border-purple-900 bg-[#120919] shadow-xl transition hover:-translate-y-1"
                >
                  <div
                    className="relative aspect-[1.7/1] overflow-hidden"
                    style={{ backgroundColor: cassetteColor }}
                  >
                    {post.type === "photo" && post.url && (
                      <img
                        src={post.url}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    )}

                    {post.type === "video" && post.url && (
                      <video
                        src={post.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        className="h-full w-full object-cover"
                      />
                    )}

                    {post.type === "text" && (
                      <div className="flex h-full items-center justify-center p-7 text-center">
                        <p className="text-lg font-bold">
                          {post.text}
                        </p>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 border-[12px] border-black/15" />

                    <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/70 px-3 py-1 text-[10px] font-black tracking-[0.25em]">
                      SETTE
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-1 text-xs font-bold tracking-widest text-purple-400">
                      {post.type.toUpperCase()}
                    </div>

                    <h3 className="font-black">
                      {post.title}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
        }
