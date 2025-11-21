import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

// -----------------------------
// CREATE MEETING
// -----------------------------
export const createMeeting = createAsyncThunk(
  "meeting/create",
  async (
    {
      userId,
      meetingTitle,
      scheduledTime,
    }: {
      userId: string;
      meetingTitle: string;
      scheduledTime: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        title: meetingTitle,
        userId,
        scheduledTime,
        durationMinutes: 60,
      };

      // Call backend using universal API
      const response = await apiClient.callApi(
        "Meetings",
        "create",
        "POST",
        payload
      );

      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ||
          "Failed to create meeting. Please try again."
      );
    }
  }
);

// -----------------------------
// JOIN MEETING
// -----------------------------
export const joinMeeting = createAsyncThunk(
  "meeting/join",
  async (
    {
      userId,
      meetingId,
    }: {
      userId: string;
      meetingId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload = { userId, meetingId };

      const response = await apiClient.callApi(
        "Meetings",
        "join",
        "POST",
        payload
      );

      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message ||
          "Failed to join meeting. Please check the meeting code."
      );
    }
  }
);
