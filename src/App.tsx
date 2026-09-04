import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import GoLive from "./pages/GoLive.tsx";
import Watch from "./pages/Watch.tsx";
import PastStreams from "./pages/PastStreams.tsx";
import PostPage from "./pages/PostPage.tsx";
import PoliAniGames from "./pages/PoliAniGames.tsx";
import Project117 from "./pages/Project117.tsx";
import KAK from "./pages/KAK.tsx";
import MarioRunFx from "@/components/MarioRunFx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MarioRunFx />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/live" element={<GoLive />} />
          <Route path="/watch/:streamId" element={<Watch />} />
          <Route path="/streams" element={<PastStreams />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/polianigames" element={<PoliAniGames />} />
          <Route path="/project117" element={<Project117 />} />
          <Route path="/kak" element={<KAK />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
