export type Mood =
  | "happy"
  | "sad"
  | "angry"
  | "calm"
  | "anxious"
  | "excited"
  | "tired"
  | "neutral";

export interface MoodCreate {
  user_id: number;
  mood: Mood;
  note: string;
}

export interface MoodEntry extends MoodCreate {
  id: number;
  created_at: string;
}

export interface JournalCreate {
  user_id: number;
  title: string;
  content: string;
}

export interface JournalEntry extends JournalCreate {
  id: number;
  created_at: string;
}