import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";

function App() {
  return (
    <div className="grain">
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-center" richColors />
      </CartProvider>
    </div>
  );
}

export default App;
