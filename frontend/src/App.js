import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";
import Poster from "@/pages/Poster";

function App() {
  return (
    <div className="grain">
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/poster" element={<Poster />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-center" richColors />
      </CartProvider>
    </div>
  );
}

export default App;
