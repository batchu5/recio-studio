import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Identities are emails; show the part before the @ as the display name.
export function displayName(identity: string) {
  return identity.split("@")[0] || identity
}

export function inviteLinkFor(roomId: string | null) {
  return roomId ? `${window.location.origin}/join/${roomId}` : ""
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
