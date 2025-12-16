Project Documentation: HackathonFront
1. Project Overview
HackathonFront is a React-based frontend application designed for a real-time communication platform, likely focusing on accessibility features such as Sign Language Translation. The application supports video and audio streaming, real-time method invocations via WebSockets, and user authentication.

Tech Stack:

Framework: React (Vite)
State Management: Redux Toolkit
Styling: Tailwind CSS
Routing: React Router DOM (v6)
API: Axios for HTTP, Native WebSocket for real-time streams.
2. Directory Structure & Key Modules
src/pages
Top-level application routes.

File	Purpose	Key Logic
MeetingRoom.tsx	Core Feature. The main video conferencing interface.	- Manages two primary streams: Host (ImageStream30) and Guest (AudioToImage).
- Handles real-time transcription updates.
- Manages socket statuses and connection states.
- Provides UI for Camera/Mic toggles and "End Meeting".
MeetingSetup.tsx	Entry point for users to start/join a meeting.	- Handles Authentication (Login/Register) before joining.
- Collects user details (Name, Email, etc.).
- Dispatches createMeeting thunk to initialize a session.
- Toggles between translation modes (sign-to-speech / speech-to-sign).
Meeting.tsx	A simplified or alternative "Create Meeting" page.	- Allows creating a meeting with Title, Schedule, and Duration.
- Validates User ID from localStorage.
- Directs user to MeetingRoom upon success.
Auth.tsx	Authentication Wrapper.	- Manages tab switching between Login and Register views.
- Renders AuthForm.
src/components
Reusable UI components and functional logic blocks.

Streaming & Media
Component	Purpose	Technical Details
ImageStream30.tsx	Video Processing (Host). Captures webcam, encodes frames, and streams via WebSocket.	- Uses MediaStreamTrackProcessor (or fallback) to read video frames.
- Encodes frames to WebP format using ImageEncoder or Canvas fallback.
- Sends binary payload via WebSocket: [Header][Payload].
- Receives text deltas (transcriptions) from server and triggers Text-to-Speech (window.speechSynthesis).
AudioToImage.tsx	Audio Processing (Guest). Captures microphone, streams audio, receives image responses.	- Captures audio at 16kHz sample rate.
- Uses AudioWorklet (or ScriptProcessor fallback) to stream PCM data.
- Sends binary payload via WebSocket.
- Receives WebP image blobs from server and displays them.
UI & Forms
Component	Purpose
AuthForm.tsx	Handles Login logic. Sends credentials to API and stores Token/UserID.
Navbar.tsx	Main navigation bar. Contains links to static pages and Auth routes.
Modal.tsx	Generic Modal wrapper with backdrop, escape key support, and click-outside closing.
MeetingModal.tsx	Specific modal for initializing a meeting (similar logic to MeetingSetup but in modal form).
EndMeetingModal.tsx	Confirmation dialog for ending a meeting.
ToggleMode.tsx	Simple toggle switch component for "Sign to Speech" vs "Speech to Sign".
src/api & src/utils
Connectivity layers.

apiClient.ts:

Wrapper around axios.
Base URL: https://tornatitansapi.shauryatechnosoft.com/api.
Automatically attaches Authorization Bearer token (except for login/register).
Standardizes API calls (Main controller).
socketClient.ts:

Generic WebSocket client helper.
Connects to a signal server (default ws://localhost:5000/ai or via env).
Implements a simple event emitter pattern (on, off, send) for message handling.
src/features (Redux)
State management slices.

authSlice.ts: Stores current user info (userId, email, fullName) and authentication token.
meetingSlice.ts: Placeholder for meeting state (participants, active meeting ID). Currently minimal implementation.
3. Key Workflows
1. Starting a Meeting
User lands on MeetingSetup (or opens MeetingModal).
User logs in or registers.
Application calls createMeeting API.
On success, redirects to /meeting/:id.
2. Video Streaming (Sign-to-Speech)
MeetingRoom mounts ImageStream30.
ImageStream30 captures webcam video.
Frames are encoded to WebP and sent to Vite_video_ws_url.
Server processes video (Sign Language AI).
Server responds with text deltas.
ImageStream30 accumulates text and uses speechSynthesis to speak it out.
3. Audio Streaming (Speech-to-Sign)
MeetingRoom mounts AudioToImage.
AudioToImage captures microphone audio (16kHz).
PCM Audio data sent to Vite_audio_ws_url.
Server processes audio.
Server responds with generated Sign Language images (WebP).
AudioToImage displays the images in real-time.