import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import MeetingSetup from "./pages/MeetingSetup";
import Meeting from "./pages/Meeting";
import MeetingRoom from "./pages/MeetingRoom";
import Features from "./pages/Features";
import About from "./pages/About";
import Contact from "./pages/Contact";

import ImageStream30 from "./components/ImageStream30";
import AudioToImage from "./components/AudioToImage";
import PublicLayout from "./components/PublicLayout";

import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route path="/auth" element={<Auth />} />

          {/* Login/Register → MeetingSetup */}
          <Route path="/meeting-setup" element={<MeetingSetup />} />

          {/* After login/register → Meeting creation page */}
          <Route path="/meeting" element={<Meeting />} />

          {/* Join meeting → Full meeting room */}
          <Route path="/meeting/:id" element={<MeetingRoom />} />

          {/* Dev Routes */}
          <Route path="/video-stream" element={<ImageStream30 />} />
          <Route path="/audio-stream" element={<AudioToImage />} />

        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
