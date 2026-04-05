import clownPepe from "@/assets/badges/clown-pepe.png";
import militarySpongebob from "@/assets/badges/military-spongebob.png";
import spongebobTongue from "@/assets/badges/spongebob-tongue.png";
import thinkingPepe from "@/assets/badges/thinking-pepe.png";
import smugPepe from "@/assets/badges/smug-pepe.png";
import surprisedSpongebob from "@/assets/badges/surprised-spongebob.png";
import smugPepeDark from "@/assets/badges/smug-pepe-dark.png";

export interface Badge {
  id: string;
  name: string;
  image: string;
}

export const AVAILABLE_BADGES: Badge[] = [
  { id: "thinking-pepe", name: "Thinking Pepe", image: thinkingPepe },
  { id: "spongebob-tongue", name: "Spongebob Tongue", image: spongebobTongue },
  { id: "smug-pepe-dark", name: "Smug Pepe", image: smugPepeDark },
  { id: "surprised-spongebob", name: "Surprised Spongebob", image: surprisedSpongebob },
  { id: "military-spongebob", name: "Military Spongebob", image: militarySpongebob },
  { id: "clown-pepe", name: "Clown Pepe", image: clownPepe },
  { id: "smug-pepe", name: "Smug Pepe Classic", image: smugPepe },
];

export interface UserProfile {
  displayName: string;
  avatar: string; // base64 or URL
  badges: string[]; // badge IDs
  isAdmin?: boolean;
  isModerator?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "gif" | "link";
  createdAt: number;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "link";
  likes: string[];
  createdAt: number;
}

const STORAGE_KEYS = {
  currentUser: "patriotvid_currentUser",
  users: "patriotvid_users",
  posts: "patriotvid_posts",
  comments: "patriotvid_comments",
};

function load<T>(key: string, fallback: T): T {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize admin
function ensureAdmin(users: Record<string, UserProfile>): Record<string, UserProfile> {
  if (!users["PatriotAdmin"]) {
    users["PatriotAdmin"] = {
      displayName: "PatriotAdmin",
      avatar: "",
      badges: [],
      isAdmin: true,
    };
  } else {
    users["PatriotAdmin"].isAdmin = true;
  }
  return users;
}

export function getUsers(): Record<string, UserProfile> {
  return ensureAdmin(load(STORAGE_KEYS.users, {}));
}

export function saveUsers(users: Record<string, UserProfile>) {
  save(STORAGE_KEYS.users, ensureAdmin(users));
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.currentUser);
}

export function setCurrentUserId(id: string) {
  localStorage.setItem(STORAGE_KEYS.currentUser, id);
}

export function getPosts(): Post[] {
  return load<Post[]>(STORAGE_KEYS.posts, []);
}

export function savePosts(posts: Post[]) {
  save(STORAGE_KEYS.posts, posts);
}

export function getComments(): Comment[] {
  return load<Comment[]>(STORAGE_KEYS.comments, []);
}

export function saveComments(comments: Comment[]) {
  save(STORAGE_KEYS.comments, comments);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
