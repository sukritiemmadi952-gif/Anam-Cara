import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Modes from "@/pages/Modes";
import Quiz from "@/pages/Quiz";
import Reflection from "@/pages/Reflection";
import Wall from "@/pages/Wall";
import WallSubmit from "@/pages/WallSubmit";
import About from "@/pages/About";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/modes" element={<Modes />} />
            <Route path="/modes/:slug/quiz" element={<Quiz />} />
            <Route path="/reflection/:slug" element={<Reflection />} />
            <Route path="/wall" element={<Wall />} />
            <Route path="/wall/submit" element={<WallSubmit />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
