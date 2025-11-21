import { createSlice } from '@reduxjs/toolkit';

interface RTCState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

const initialState: RTCState = {
  localStream: null,
  remoteStreams: new Map(),
  connectionStatus: 'disconnected',
};

const rtcSlice = createSlice({
  name: 'rtc',
  initialState,
  reducers: {
    // Add RTC reducers here
  },
});

export default rtcSlice.reducer;

