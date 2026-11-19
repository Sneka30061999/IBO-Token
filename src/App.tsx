import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { LoadingSkeleton } from "./components/States";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Tokenomics = lazy(() => import("./pages/Tokenomics"));
const BurnLiquidity = lazy(() => import("./pages/BurnLiquidity"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Whitepaper = lazy(() => import("./pages/Whitepaper"));
const FAQ = lazy(() => import("./pages/FAQ"));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollTop />
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="container-x py-20">
              <LoadingSkeleton className="h-64 w-full" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/tokenomics" element={<Tokenomics />} />
            <Route path="/burn-liquidity" element={<BurnLiquidity />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/whitepaper" element={<Whitepaper />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
