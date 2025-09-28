import axios from "axios";
import { ENDPOINTS } from "@/config/api";

export const getAvailableSlots = async (date, counselorId) => {
  const res = await axios.get(ENDPOINTS.AVAILABLE_SLOTS, {
    params: { date, counselorId },
  });
  return res.data;
};

export const createBooking = async ({ clientId, scheduleId }) => {
  const res = await axios.post(ENDPOINTS.BOOKINGS, {
    clientId,
    scheduleId,
  });
  return res.data;
};
