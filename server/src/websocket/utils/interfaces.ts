export interface ClientToServerEvents {}
export interface ServerToClientEvents {}
export interface InterServerEvents {}
export interface SocketData {
  eventTriggered: string | null;
  userId: string | null;
  converationId: string | null;
}
