import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./component/Navbar";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfToday,
  addHours,
  parse,
} from "date-fns";
import { useSearchParams } from "react-router-dom";

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

interface TimeSlot {
  id?: string;
  start: string;
  end: string;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [newSlot, setNewSlot] = useState<TimeSlot>({ start: "", end: "" });
  const [counselorId, setCounselorId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const today = startOfToday();

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });



  // Fetch profile with status and approval
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      const decoded = parseJwt(token);
      const id = decoded?.id || decoded?.userId || null;
      setCounselorId(id);

      if (!id) {
        setLoadingProfile(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/counselors/profile/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        // Expecting res.data.status (string) and res.data.isApproved (boolean)
        setStatus(res.data.status);
        setIsApproved(res.data.isApproved);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Normalize approval and status for logic
  const approved = isApproved === true;
  const activeStatus = status?.toLowerCase() === "active";
  const canModifyAvailability = activeStatus && approved;

  // Fetch schedule when currentMonth or counselorId changes
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!counselorId) return;

      const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      try {
        const res = await axios.get(
          `http://localhost:3000/schedule/available`,
          {
            params: { startDate, endDate, counselorId },
          },
        );

        const scheduleMap: Record<string, TimeSlot[]> = {};
        res.data.forEach((slot: any) => {
          const dateStr = slot.date.split("T")[0];
          if (!scheduleMap[dateStr]) scheduleMap[dateStr] = [];
          scheduleMap[dateStr].push({
            id: slot.id,
            start: slot.startTime,
            end: slot.endTime,
          });
        });

        const newSchedule: DaySchedule[] = Object.entries(scheduleMap).map(
          ([date, slots]) => ({
            date,
            slots,
          }),
        );

        setSchedule(newSchedule);
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      }
    };

    fetchSchedule();
  }, [currentMonth, counselorId]);

  // Auto update end time +1 hour when start time changes
  const handleStartTimeChange = (startTime: string) => {
    setNewSlot((prev) => {
      if (!startTime) {
        return { start: "", end: "" };
      }

      const parsedTime = parse(startTime, "HH:mm", new Date());
      const endTimeDate = addHours(parsedTime, 1);
      const endTime = format(endTimeDate, "HH:mm");
      return { start: startTime, end: endTime };
    });
  };

  const handleAddSlot = async () => {
    if (!selectedDate || !newSlot.start || !newSlot.end) return;
    if (!canModifyAvailability) {
      alert(
        "Your account is not active or approved. You cannot post articles or set availabilities.",
      );
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const res = await axios.post(`http://localhost:3000/schedule`, {
        date: dateStr,
        startTime: newSlot.start,
        endTime: newSlot.end,
        counselorId,
        isAvailable: true,
      });

      const newEntry: TimeSlot = {
        id: res.data.id,
        start: res.data.startTime,
        end: res.data.endTime,
      };

      setSchedule((prev) => {
        const existing = prev.find((s) => s.date === dateStr);
        if (existing) {
          return prev.map((s) =>
            s.date === dateStr ? { ...s, slots: [...s.slots, newEntry] } : s,
          );
        }
        return [...prev, { date: dateStr, slots: [newEntry] }];
      });

      setNewSlot({ start: "", end: "" });
    } catch (err) {
      console.error("Failed to add slot", err);
    }
  };

  const handleRemoveSlot = async (date: Date, slot: TimeSlot) => {
    if (!slot.id) return;
    if (!canModifyAvailability) {
      alert(
        "Your account is not active or approved. You cannot post articles or set availabilities.",
      );
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/schedule/${slot.id}`);
      const dateStr = format(date, "yyyy-MM-dd");

      setSchedule((prev) =>
        prev.map((s) =>
          s.date === dateStr
            ? { ...s, slots: s.slots.filter((t) => t.id !== slot.id) }
            : s,
        ),
      );
    } catch (err) {
      console.error("Failed to delete slot", err);
    }
  };

  const getDateSchedule = (date: Date): TimeSlot[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    const daySchedule = schedule.find((s) => s.date === dateStr);
    return daySchedule?.slots || [];
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today)) {
      return;
    }
    setSelectedDate(date);
  };

  if (loadingProfile) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex gap-8 p-8">
        <div className="w-96 rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b px-6 py-2">
            <span className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
                  )
                }
                className="p-1 hover:bg-gray-100 rounded">
                ←
              </button>
              <button
                onClick={() =>
                  setCurrentMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
                  )
                }
                className="p-1 hover:bg-gray-100 rounded">
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs font-semibold">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
              <div key={day} className="bg-white py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map((day) => {
              const hasSlots = getDateSchedule(day).length > 0;
              const isPastDate = isBefore(day, today);
              return (
                <button
                  key={day.toString()}
                  onClick={() => !isPastDate && handleDateClick(day)}
                  disabled={isPastDate}
                  className={` 
                   bg-white py-4 text-center relative 
                   ${!isSameMonth(day, currentMonth) && "text-gray-400"} 
                   ${isToday(day) && "font-bold text-blue-600"} 
                   ${
                     selectedDate &&
                     isSameDay(day, selectedDate) &&
                     "bg-blue-100"
                   } 
                   ${
                     isPastDate
                       ? "cursor-not-allowed bg-gray-100 text-gray-400"
                       : "hover:bg-gray-50"
                   }
                 `}>
                  {format(day, "d")}
                  {hasSlots && !isPastDate && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="flex-1 rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold mb-6">
              {format(selectedDate, "EEE MMM dd yyyy")}
            </h2>

            {!canModifyAvailability && (
              <p className="text-red-600 mb-6 text-center">
                Your account is not active or approved. You cannot post articles
                or set availabilities.
              </p>
            )}

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Add New Time Slot</h3>
                <div className="flex gap-4 items-end">
                  <div>
                    <label className="block text-sm mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newSlot.start}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="border rounded px-2 py-1"
                      disabled={!canModifyAvailability}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">End Time</label>
                    <input
                      type="time"
                      value={newSlot.end}
                      readOnly
                      className="border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={handleAddSlot}
                    disabled={
                      !canModifyAvailability || !newSlot.start || !newSlot.end
                    }
                    className={`px-4 py-1 rounded ${
                      canModifyAvailability
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}>
                    Add Slot
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Available Time Slots</h3>
                <div className="grid grid-cols-2 gap-4">
                  {getDateSchedule(selectedDate).map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-blue-50 rounded-md px-4 py-2">
                      <span>
                        {slot.start} - {slot.end}
                      </span>
                      {canModifyAvailability && (
                        <button
                          onClick={() => handleRemoveSlot(selectedDate, slot)}
                          className="text-red-600 hover:text-red-700">
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
