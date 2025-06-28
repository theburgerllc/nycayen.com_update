// components/ChatToggleButton.tsx
"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    tidioChatApi?: {
      show: () => void;
      open: () => void;
    };
  }
}

export default function ChatToggleButton() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const showChat = () => {
      window.tidioChatApi?.show();
      window.tidioChatApi?.open();
    };
    document
      .getElementById("chat-toggle-btn")
      ?.addEventListener("click", showChat);
  }, []);
  return (
    <button
      id="chat-toggle-btn"
      aria-label="Chat with us"
      className="fixed bottom-20 right-6 bg-amber-500 hover:bg-amber-light text-white p-4 rounded-full shadow-lg z-50"
    >
      💬
    </button>
  );
}
