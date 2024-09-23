export interface ClientToServerEvents {
  "join-conversation": (data: Record<string, string>) => void;
}
export interface ServerToClientEvents {
  error: (data: object) => void;
  "join-conversation": (data: Record<string, string>) => void;
  "leave-conversation": () => void;
}
export interface InterServerEvents {}
export interface SocketData {
  eventTriggered: string | null;
  userId: string | null;
  converationId: string | null;
}

export interface UserSocket {
  socket: string;
  room: string | undefined;
}
