import { createContext, useContext } from "react";
import { useRoomManager } from "@/hooks/useRoom";

const RoomContext = createContext<ReturnType<typeof useRoomManager> | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const value = useRoomManager();
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used inside RoomProvider");
  return ctx;
}
