import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import TalentSearch from "./pages/Search";
import CandidateDetail from "./pages/CandidateDetail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CandidateProfile from "./pages/CandidateProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/search" element={<TalentSearch />} />
            <Route path="/candidates/:id" element={<CandidateDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidates/:id/profile" element={<CandidateProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
