import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About'
import Signup from './pages/SignUp';
import Profile from './pages/Profile';
import Signin from './pages/SignIn';

export default function App() {
  return <BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/sign-in" element={<Signin />} />
    <Route path="/sign-up" element={<Signup />} />
    <Route path="/profile" element={<Profile />} />
    </Routes>
  
  </BrowserRouter>
}
