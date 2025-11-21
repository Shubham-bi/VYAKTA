import { createSlice } from '@reduxjs/toolkit';

interface MeetingState {
  currentMeeting: {
    id: string | null;
    code: string | null;
    participants: string[];
  } | null;
  isInMeeting: boolean;
}

const initialState: MeetingState = {
  currentMeeting: null,
  isInMeeting: false,
};

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    // Add meeting reducers here
  },
});

export default meetingSlice.reducer;

