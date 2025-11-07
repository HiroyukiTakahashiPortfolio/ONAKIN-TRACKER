export type User = {
  id: string;
  name: string;
  registeredAt: string; // YYYY-MM-DD
  banned?: boolean;
  muted?: boolean;
};

export type JournalEntry = { date: string; note?: string };

export type ChatMessage = {
  id: string;
  room: string;
  userId: string;
  name: string;
  text: string;
  createdAt: number;
  hidden?: boolean;
};

export type Article = { id: string; min: number; title: string; content: string };
