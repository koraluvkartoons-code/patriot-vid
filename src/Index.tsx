import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import coin from "@/assets/spankr-coin.png";
import socksVideo from "@/assets/project117-socks-party.mp4";
import { Button } from "@/components/ui/button";

export default function Project117() {
  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero sticky top-0 z-40 border-b border-border">
        <div className="container max-w-3xl mx-auto px-3 py-2 flex items-center justify-between">
          <h1 className="text-base sm:text-xl font-extrabold text-rainbow-neon">PROJECT 117 (117CPE)</h1>
          <Link to="/"><Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-rainbow-neon"><ArrowLeft className="w-3 h-3 mr-1" />BACK</Button></Link>
        </div>
      </header>
      <main className="container max-w-3xl mx-auto px-3 py-4">
        <article className="project117-card">
          <div className="project117-coin"><img src={coin} alt="$SPANKR coin" /></div>
          <h2 className="project117-title">PROJECT 117 (117CPE)</h2>
          <p className="project117-disclaimer">$SPANKR IS NOT A REAL MEME COIN IT CAN'T BE TRADED, SPENT OR BROUGHT ITS SIMPLY AN ECONOMIC CONCEPT THAT I WILL SCALE ONCE I BLOW UP SO IM NOT ASKING FOR ANYTHING IM SIMPLY PRESENTING AN IDEA LOVE Y'ALL</p>
          <div className="project117-body">
            <p>Nothing helps the average American or the working class within political frameworks but legislation and lip service my primary movement is the BASEDTRIOTS MOVEMENT (BASED PATRIOTS) but I do a lot of research on the side about the financial system so I thought how about the FINAL PART of my movement and I mean it this time im not creating anything else tied to Basedtriots this is the last thing but I thought about creating a wing just for teaching people how to go against the system all systems with basedtriots still being my main movement and what my followers are known as</p>
            <p>117 is a reference to Halo since I'm The Reclaimer</p>
            <p>PRO117</p>
            <p>Counter Pol-Ec = Counter Politics/Economics</p>
            <p>SLOGAN:</p>
            <p>"WE ARENT TRYING TO MAKE IT TO THE CAPITAL</p>
            <p>WE REENGINEER AND REDISTRIBUTE THE CAPITAL"</p>
            <p>ITS NOT TO THE MOON, ITS TO THE REACH- JAKORA L. HAYES</p>
          </div>
          <h2 className="project117-heading">RED AND BLUE SOCKS PARTY</h2>
          <video src={socksVideo} controls playsInline preload="metadata" className="project117-video" />
          <p className="project117-footer">WHATS UP POLGAWEEBS/BASEDTRIOTS ITS JAKORA YOU'VE REACHED THE END OF THIS PAGE BUT ITS JUST THE BEGINNING</p>
          <div className="project117-slogan-block">
            <p>SLOGAN: REVERSE CAPITALISM LIKE MR.KRABS, THE AVERAGE WORKER IS EXPLOITED LIKE SQUIDWARD, BE KIND LIKE SPONGEBOB BUT DONT BE STUPID DONT BE PATRICK STAR REPUBLICAN AND DEMOCRAT IS LIKE THE CHUM BUCKET AND THE KRUSTY KRAB, MY GOAL IS TO BRING THE ESTABLISHMENT TO ITS KNEES LIKE FRED THE FISH</p>
          </div>
        </article>
      </main>
    </div>
  );
}
