import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Schools from './pages/Schools';
import Login from './pages/Login';

function Layout({ children, hideNav }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!hideNav && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideNav && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/listings" element={<Layout><Listings /></Layout>} />
      <Route path="/listings/:id" element={<Layout><ListingDetail /></Layout>} />
      <Route path="/schools" element={<Layout><Schools /></Layout>} />
      <Route path="/login" element={<Layout hideNav><Login /></Layout>} />
    </Routes>
  );
}
