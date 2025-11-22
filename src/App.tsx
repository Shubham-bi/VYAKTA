import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import MeetingSetup from "./pages/MeetingSetup";
import Meeting from "./pages/Meeting";
import MeetingRoom from "./pages/MeetingRoom";

import ImageStream30 from "./components/ImageStream30";
import AudioToImage from "./components/AudioToImage";

import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
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
