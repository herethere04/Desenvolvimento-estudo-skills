export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  role: string;
  memberCount: number;
}

export interface BoardDetails {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  createdAt: string;
  members: BoardMember[];
  columns: Column[];
  tags: Tag[];
}

export interface BoardMember {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export interface Column {
  id: string;
  name: string;
  position: number;
  color: string;
  cards: Card[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CardActivity {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  position: number;
  createdAt: string;
  tags: Tag[];
  assignedMembers: Array<{ id: string; name: string; email: string }>;
  activities?: CardActivity[];
  _count?: { activities: number };
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}
