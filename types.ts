
export enum Sender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  sources?: WebSource[];
}
