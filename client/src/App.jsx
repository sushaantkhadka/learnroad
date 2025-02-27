import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/headerFooter/Footer";
import Navbar from "./components/headerFooter/Navbar";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";

export default function App() {
  return (
    <BrowserRouter>
    <Navbar />

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
    </Routes>

    <Footer />
    </BrowserRouter>
  )
}
