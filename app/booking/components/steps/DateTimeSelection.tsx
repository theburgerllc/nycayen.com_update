"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, ArrowLeft, User, MapPin } from 'lucide-react';
import { useBookingState } from '../../hooks/useBookingState';

interface TimeSlot {
  time: string;
  available: boolean;
  staffMember?: string;
}

interface StaffMember {
  id: string;
  name: string;
  specialties: string[];
  avatar?: string;
}

const mockTimeSlots: TimeSlot[] = [
  { time: '09:00', available: true, staffMember: 'nycayen' },
  { time: '10:00', available: true, staffMember: 'nycayen' },
  { time: '11:00', available: false },
  { time: '12:00', available: true, staffMember: 'nycayen' },
  { time: '13:00', available: false },
  { time: '14:00', available: true, staffMember: 'nycayen' },
  { time: '15:00', available: true, staffMember: 'nycayen' },
  { time: '16:00', available: true, staffMember: 'nycayen' },
  { time: '17:00', available: false },
  { time: '18:00', available: true, staffMember: 'nycayen' },
];

const staffMembers: StaffMember[] = [
  {
    id: 'nycayen',
    name: 'Nycayen Moore',
    specialties: ['Hair Artistry', 'Wig Design', 'Color Specialist', 'Bridal Styling'],
  },
];

export default function DateTimeSelection() {
  const { state, updateState, nextStep, prevStep } = useBookingState();
  const [selectedDate, setSelectedDate] = useState<Date | null>(state.selectedDate || null);
  const [selectedTime, setSelectedTime] = useState<string | null>(state.selectedTime || null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(state.selectedStaff || null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate next 30 days for calendar
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays and Mondays (salon closed)
      if (date.getDay() !== 0 && date.getDay() !== 1) {
        days.push(date);
      }
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  useEffect(() => {
    if (selectedDate) {
      setIsLoading(true);
      // Simulate API call to fetch availability
      setTimeout(() => {
        setAvailableSlots(mockTimeSlots);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedStaff(null);
  };

  const handleTimeSelect = (time: string, staffMember?: string) => {
    setSelectedTime(time);
    setSelectedStaff(staffMember || 'nycayen');
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime && selectedStaff) {
      updateState({
        selectedDate,
        selectedTime,
        selectedStaff,
      });
      nextStep();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const canContinue = selectedDate && selectedTime && selectedStaff;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-playfair text-white mb-2">Select Date & Time</h2>
        <p className="text-gray-300">Choose your preferred appointment slot</p>
      </div>

      {/* Studio Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <MapPin className="text-amber-400" size={24} />
          <div>
            <h3 className="text-white font-semibold">Nycayen Moore Hair Artistry</h3>
            <p className="text-gray-300 text-sm">Professional Hair Studio, New York, NY</p>
          </div>
        </div>
        <div className="text-gray-300 text-sm">
          <p>📍 Manhattan Location • 🕐 Tuesday - Saturday, 9:00 AM - 7:00 PM</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-amber-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Choose Date</h3>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-400 text-sm py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isDisabled = isDateDisabled(date);
              
              return (
                <button
                  key={index}
                  onClick={() => !isDisabled && handleDateSelect(date)}
                  disabled={isDisabled}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'bg-amber-500 text-white shadow-lg'
                      : isDisabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-amber-400 text-sm font-medium">
                Selected: {formatDate(selectedDate)}
              </p>
            </div>
          )}
        </motion.div>

        {/* Time Slots */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-amber-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Available Times</h3>
          </div>

          {!selectedDate ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Please select a date first</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-700/50 h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const staffMember = staffMembers.find(s => s.id === slot.staffMember);
                
                return (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time, slot.staffMember)}
                    disabled={!slot.available}
                    className={`
                      w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between
                      ${isSelected
                        ? 'bg-amber-500 text-white shadow-lg'
                        : slot.available
                          ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white'
                          : 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">
                        {slot.time}
                      </div>
                      {staffMember && (
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span className="text-sm">{staffMember.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {!slot.available && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                        Booked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Staff Information */}
      {selectedStaff && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          {(() => {
            const staff = staffMembers.find(s => s.id === selectedStaff);
            return staff ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{staff.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {staff.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </motion.div>
      )}

      {/* Booking Summary */}
      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Appointment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Date:</span>
              <span className="text-white font-medium">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Time:</span>
              <span className="text-white font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Duration:</span>
              <span className="text-white font-medium">~{Math.round(state.estimatedDuration / 60 * 10) / 10} hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Stylist:</span>
              <span className="text-white font-medium">Nycayen Moore</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Services
        </button>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300
            ${canContinue
              ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continue to Your Info
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}