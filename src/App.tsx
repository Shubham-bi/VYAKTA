import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Home from './pages/Home';
import Auth from './pages/Auth';
import MeetingSetup from './pages/MeetingSetup';
import Meeting from './pages/Meeting';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/meeting-setup" element={<MeetingSetup />} />

          {/* ❌ REMOVE old route */}
          {/* <Route path="/meeting" element={<Meeting />} /> */}

          {/* ✅ KEEP ONLY THIS (Meeting ID comes from URL) */}
          <Route path="/meeting/:id" element={<Meeting />} />

          {/* Static pages */}
          <Route path="/about" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl">About Us</h1></div>} />
          <Route path="/features" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl">Feature</h1></div>} />
          <Route path="/contact" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl">Contact</h1></div>} />
          <Route path="/team" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl">Our Team</h1></div>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
