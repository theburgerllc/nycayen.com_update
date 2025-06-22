"use client";
import BookingFlow from "./components/BookingFlow";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-stone-900">
      <div className="pt-20">
        <BookingFlow />
      </div>
    </div>
  );
}