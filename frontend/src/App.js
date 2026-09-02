import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartSheet from "./components/CartSheet";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Admin from "./pages/Admin";
import AuthCallback from "./pages/AuthCallback";

function Layout() {
  const location = useLocation();
  // Handle OAuth return: session_id arrives in the URL fragment
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <div className="App">
      <Navbar />
      <CartSheet />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/callback" element={<AuthCallback />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" theme="dark" richColors />
          <Layout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
