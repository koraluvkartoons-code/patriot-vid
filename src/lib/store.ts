import clownPepe from "@/assets/badges/clown-pepe.png";
import militarySpongebob from "@/assets/badges/military-spongebob.png";
import spongebobTongue from "@/assets/badges/spongebob-tongue.png";
import thinkingPepe from "@/assets/badges/thinking-pepe.png";
import smugPepe from "@/assets/badges/smug-pepe.png";
import surprisedSpongebob from "@/assets/badges/surprised-spongebob.png";
import smugPepeDark from "@/assets/badges/smug-pepe-dark.png";
import angryPepe from "@/assets/badges/angry-pepe.png";
import punchingPepe from "@/assets/badges/punching-pepe.png";
import kermitGun from "@/assets/badges/kermit-gun.png";
import trumpMugshot from "@/assets/badges/trump-mugshot.png";
import trollFace from "@/assets/badges/troll-face.png";
import sadPepe from "@/assets/badges/sad-pepe.png";
import trollSunglasses from "@/assets/badges/troll-sunglasses.png";
import brownPepe from "@/assets/badges/brown-pepe.png";
import poggersPepe from "@/assets/badges/poggers-pepe.png";
import surprisedPikachu from "@/assets/badges/surprised-pikachu.png";
import laughingGuy from "@/assets/badges/laughing-guy.png";

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
  { id: "angry-pepe", name: "Angry Pepe", image: angryPepe },
  { id: "punching-pepe", name: "Punching Pepe", image: punchingPepe },
  { id: "kermit-gun", name: "Kermit Gun", image: kermitGun },
  { id: "trump-mugshot", name: "Trump Mugshot", image: trumpMugshot },
  { id: "troll-face", name: "Troll Face", image: trollFace },
  { id: "sad-pepe", name: "Sad Pepe", image: sadPepe },
  { id: "troll-sunglasses", name: "Troll Sunglasses", image: trollSunglasses },
  { id: "brown-pepe", name: "Brown Pepe", image: brownPepe },
  { id: "poggers-pepe", name: "Poggers Pepe", image: poggersPepe },
  { id: "surprised-pikachu", name: "Surprised Pikachu", image: surprisedPikachu },
  { id: "laughing-guy", name: "Laughing Guy", image: laughingGuy },
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
