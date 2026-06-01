import { useEffect, useRef } from "react";
import axios from "axios";

const BATCH_INTERVAL_MS = 5000;
const MAX_QUEUE_SIZE = 10;

/**
 * @desc Custom hook for resilient batch-driven event tracking in the chatbot
 * @param {String} sessionId - Unique session ID for grouping events
 * @param {String} token - Auth bearer token for backend route authentication
 */
export default function useTracker(sessionId, token) {
  const eventQueue = useRef([]);
  const timerRef = useRef(null);

  const flushQueue = async () => {
    if (eventQueue.current.length === 0 || !token) return;

    const payload = {
      sessionId,
      events: [...eventQueue.current],
    };

    // Clear queue immediately to avoid race duplication
    eventQueue.current = [];

    try {
      const apiEndpoint = `${import.meta.env.VITE_API_URL}/analytics/events`;
      await axios.post(apiEndpoint, payload, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
    } catch (error) {
      console.error("[useTracker SDK] Failed to dispatch tracking batch:", error);
      // Re-queue events on failure to prevent data loss
      eventQueue.current = [...payload.events, ...eventQueue.current];
    }
  };

  const track = (eventType, eventPayload = {}) => {
    const event = {
      eventType,
      payload: eventPayload,
      timestamp: new Date().toISOString(),
    };

    eventQueue.current.push(event);

    if (eventQueue.current.length >= MAX_QUEUE_SIZE) {
      flushQueue();
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(flushQueue, BATCH_INTERVAL_MS);
    return () => {
      clearInterval(timerRef.current);
      flushQueue(); // Ensure final flush on exit/cleanup
    };
  }, [sessionId, token]);

  return { track };
}
