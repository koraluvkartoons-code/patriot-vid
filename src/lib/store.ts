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
import dabbingSteve from "@/assets/badges/dabbing-steve.png";
import minecraftPepe from "@/assets/badges/minecraft-pepe.png";
import animePepe from "@/assets/badges/anime-pepe.png";
import elonWave from "@/assets/badges/elon-wave.png";
import gamerPepe from "@/assets/badges/gamer-pepe.png";
import sonicLook from "@/assets/badges/sonic-look.png";
import sonicNo from "@/assets/badges/sonic-no.png";
import sonicPose from "@/assets/badges/sonic-pose.png";
import robloxCool from "@/assets/badges/roblox-cool.png";
import epsteinSmile from "@/assets/badges/epstein-smile.png";
import shrekLook from "@/assets/badges/shrek-look.png";
import luffyCry from "@/assets/badges/luffy-cry.png";
import vegetaRain from "@/assets/badges/vegeta-rain.png";
import comradeDoge from "@/assets/badges/comrade-doge.png";
import hammerSickle from "@/assets/badges/hammer-sickle.png";
import patriotLion from "@/assets/badges/patriot-lion.png";
import amongUsBat from "@/assets/badges/among-us-bat.png";
import saitamaLook from "@/assets/badges/saitama-look.png";
import trumpFist from "@/assets/badges/trump-fist.png";
import trumpPoint from "@/assets/badges/trump-point.png";
import npcCurrentThing from "@/assets/badges/npc-current-thing.png";

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
  { id: "dabbing-steve", name: "Dabbing Steve", image: dabbingSteve },
  { id: "minecraft-pepe", name: "Minecraft Pepe", image: minecraftPepe },
  { id: "anime-pepe", name: "Anime Pepe", image: animePepe },
  { id: "elon-wave", name: "Elon Wave", image: elonWave },
  { id: "gamer-pepe", name: "Gamer Pepe", image: gamerPepe },
  { id: "sonic-look", name: "Sonic Look", image: sonicLook },
  { id: "sonic-no", name: "Sonic No", image: sonicNo },
  { id: "sonic-pose", name: "Sonic Pose", image: sonicPose },
  { id: "roblox-cool", name: "Roblox Cool", image: robloxCool },
  { id: "epstein-smile", name: "Epstein Smile", image: epsteinSmile },
  { id: "shrek-look", name: "Shrek Look", image: shrekLook },
  { id: "luffy-cry", name: "Luffy Cry", image: luffyCry },
  { id: "vegeta-rain", name: "Vegeta Rain", image: vegetaRain },
  { id: "comrade-doge", name: "Comrade Doge", image: comradeDoge },
  { id: "hammer-sickle", name: "Hammer & Sickle", image: hammerSickle },
  { id: "patriot-lion", name: "Patriot Lion", image: patriotLion },
  { id: "among-us-bat", name: "Among Us Bat", image: amongUsBat },
  { id: "saitama-look", name: "Saitama Look", image: saitamaLook },
  { id: "trump-fist", name: "Trump Fist", image: trumpFist },
  { id: "trump-point", name: "Trump Point", image: trumpPoint },
  { id: "npc-current-thing", name: "NPC Current Thing", image: npcCurrentThing },
];

export interface UserProfile {
  displayName: string;
  avatar: string;
  badges: string[];
  isAdmin?: boolean;
  isModerator?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: string;
  likes: string[];
  createdAt: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  createdAt: string;
}

// Current user ID is still stored locally (session identity)
export function getCurrentUserId(): string | null {
  return localStorage.getItem("patriotvid_currentUser");
}

export function setCurrentUserId(id: string) {
  localStorage.setItem("patriotvid_currentUser", id);
}
