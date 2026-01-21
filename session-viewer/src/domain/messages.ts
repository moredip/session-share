export interface DisplayMessage {
  uuid: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
