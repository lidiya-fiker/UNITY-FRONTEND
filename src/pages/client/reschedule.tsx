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

interface TimeSlot {
  id?: string;
  start: string;
  end: string;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

// interface Therapist {
//   fullName: string;
//   firstLetter: string;
//   specialization: string;
//   image?: string;
// }

const API_URL = "http://localhost:3000";

const SelectTimeSlot: React.FC = () => {
  const location = useLocation();
  const passedSessions = location.state?.sessions || [];
  const latestSession = passedSessions[0];

  const [currentStep, setCurrentStep] = useState(2);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // const selectedTherapist: Therapist = {
  //   fullName: "Dr. Jane Smith",
  //   firstLetter: "J",
  //   specialization: "Cognitive Behavioral Therapy",
  //   image: "", // Can be left empty to fallback to initials
  // };

  const params = useParams<{ yearMonth?: string }>();

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

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!latestSession?.schedule?.counselorId) return;

      const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      try {
        const res = await axios.get(`${API_URL}/schedule/available`, {
          params: {
            startDate,
            endDate,
            counselorId: latestSession.schedule.counselorId,
          },
        });

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
  }, [latestSession, currentMonth]);

  const handleRebook = async () => {
    if (!selectedSlot || !latestSession?.id || !latestSession.clientId) return;

    setLoading(true);
    setError(null);
    setSuccess(false); // Reset previous success

    try {
      const response = await axios.post(`${API_URL}/api/rebook`, {
        oldBookingId: latestSession.id,
        newScheduleId: selectedSlot.id,
        clientId: latestSession.clientId,
      });

      // Optional: you can log or validate the response if needed
      // console.log("Rebook response:", response.data);

      setSuccess(true);

      // Slight delay to ensure state is committed before navigation
      setTimeout(() => {
        navigate("/booking-success");
      }, 100);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to rebook. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-[#4b2a75] mb-6">
          Select Available Time Slot
        </h2>

        {/* Therapist Info Card
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Selected Therapist
          </h3>
          <div className="flex items-center space-x-4 p-4 bg-[#f5f0ff] rounded-lg">
            {selectedTherapist ? (
              <img
                src={selectedTherapist.image}
                alt={selectedTherapist.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#4b2a75] flex items-center justify-center text-white text-xl font-bold">
                {selectedTherapist?.firstLetter || "?"}
              </div>
            )}
            <div>
              <h4 className="font-medium text-[#4b2a75]">
                {selectedTherapist?.fullName}
              </h4>
              <p className="text-gray-600">
                {selectedTherapist?.specialization}
              </p>
            </div>
          </div>
        </div> */}

        {/* Calendar and Booking Panel */}
        <div className="flex gap-8 p-8">
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
                        }
                      `}>
                    {format(day, "d")}
                    {hasSlots && !isDisabled && (
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
            onClick={handleRebook}
            disabled={!selectedSlot || loading}
            className={`bg-[#4b2a75] text-white px-6 py-2 rounded-md transition-colors ${
              !selectedSlot
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#3a2057]"
            }`}>
            Rebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTimeSlot;
