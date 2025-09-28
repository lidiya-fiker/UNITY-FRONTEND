import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
  startOfToday,
  parse,
} from "date-fns";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/config/api";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

interface Counselor {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  image?: string;
}

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  zoomJoinUrl?: string;
  counselor: Counselor;
}



const SelectTimeSlot: React.FC = () => {
  const location = useLocation();
  const { session, availability, clientId } = location.state || {};
  const navigate = useNavigate();
  const params = useParams<{ yearMonth?: string }>();

  const [currentStep] = useState(2);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initialMonth = params.yearMonth
    ? parse(params.yearMonth, "yyyy-MM", new Date())
    : new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(initialMonth),
  );
  const today = startOfToday();
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Debug state
  useEffect(() => {
    console.log("SelectTimeSlot state:", { session, availability, clientId });
  }, [session, availability, clientId]);

  // Map availability to schedule
  useEffect(() => {
    if (!availability?.dates) return;
    const newSchedule: DaySchedule[] = availability.dates.map(
      ({ date, times }) => ({
        date,
        slots: times.map(({ id, startTime, endTime }) => ({
          id,
          start: startTime,
          end: endTime,
        })),
      }),
    );
    setSchedule(newSchedule);
  }, [availability]);

  const getDateSchedule = (date: Date): TimeSlot[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    const daySchedule = schedule.find((s) => s.date === dateStr);
    return daySchedule?.slots || [];
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, today)) return;
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleRebook = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    if (!session?.id) {
      setError("Missing session ID.");
      return;
    }
    if (!clientId) {
      setError("Missing client ID.");
      return;
    }

    console.log("Rebooking with:", {
      oldBookingId: session.id,
      newScheduleId: selectedSlot.id,
      clientId,
    });

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post(`${API_URL}/api/rebook`, {
        oldBookingId: session.id,
        newScheduleId: selectedSlot.id,
        clientId,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/booking-success");
      }, 100);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(
          err.response.data?.message || "Failed to rebook. Please try again.",
        );
      } else if (err instanceof Error) {
        setError(err.message || "Failed to rebook. Please try again.");
      } else {
        setError("Failed to rebook. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session || !availability || !clientId) {
    return (
      <div className="p-8 font-sans text-center">
        <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
          Error: Missing Session Data
        </h2>
        <p className="text-gray-600 mb-4">
          Please return to the dashboard and try again.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-[#4b2a75] text-white px-6 py-2 rounded-md hover:bg-[#3a2057]">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const counselor = session.counselor;
  const fullName = `${counselor.firstName} ${counselor.lastName}`.trim();
  const firstLetter = counselor.firstName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="p-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
          Reschedule Session
        </h2>

        {/* Counselor Info Card */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Selected Counselor
          </h3>
          <div className="flex items-center space-x-4 p-4 bg-[#f5f0ff] rounded-lg">
            {counselor.image ? (
              <img
                src={`${API_URL}/uploads/profile-pictures/${counselor.image}`}
                alt={fullName}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src = "/path/to/images/default-avatar.jpg")
                }
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#4b2a75] flex items-center justify-center text-white text-xl font-bold">
                {firstLetter}
              </div>
            )}
            <div>
              <h4 className="font-medium text-[#4b2a75]">{fullName}</h4>
              <p className="text-gray-600">
                {counselor.specialization || "Counselor"}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            Session rescheduled successfully! Redirecting...
          </div>
        )}

        {/* Calendar and Booking Panel */}
        <div className="flex gap-8">
          {/* Calendar Panel */}
          <div className="w-96 rounded-lg bg-white shadow">
            <div className="flex items-center justify-between border-b px-6 py-2">
              <span className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 rounded">
                  ←
                </button>
                <button
                  onClick={handleNextMonth}
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
                const dateStr = format(day, "yyyy-MM-dd");
                const hasSlots = schedule.some((s) => s.date === dateStr);
                const isPastDate = isBefore(day, today);
                const isDisabled = isPastDate || !hasSlots;

                return (
                  <button
                    key={day.toString()}
                    onClick={() => !isDisabled && handleDateClick(day)}
                    disabled={isDisabled}
                    className={`bg-white py-4 text-center relative
                      ${!isSameMonth(day, currentMonth) && "text-gray-400"}
                      ${isToday(day) && "font-bold text-blue-600"}
                      ${
                        selectedDate && isSameDay(day, selectedDate)
                          ? "bg-blue-100"
                          : ""
                      }
                      ${
                        isDisabled
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : "hover:bg-gray-50"
                      }`}>
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

          {/* Booking Panel */}
          {selectedDate && (
            <div className="flex-1 rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold mb-6">
                {format(selectedDate, "EEE MMM dd yyyy")} GMT+0300 (East Africa
                Time)
              </h2>
              <div>
                <h3 className="font-medium mb-4">Available Time Slots</h3>
                <div className="grid grid-cols-2 gap-4">
                  {getDateSchedule(selectedDate).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border 
                        ${
                          selectedSlot?.id === slot.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 hover:bg-blue-100"
                        }`}>
                      {slot.start} - {slot.end}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300">
            Back
          </button>
          <button
            onClick={handleRebook}
            disabled={!selectedSlot || loading}
            className={`bg-[#4b2a75] text-white px-6 py-2 rounded-md transition-colors ${
              !selectedSlot || loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#3a2057]"
            }`}>
            {loading ? "Rebooking..." : "Rebook"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTimeSlot;
