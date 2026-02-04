// /lib/timecard/users.ts
import { get } from "@/lib/timecard/api";

export interface User {
  [x: string]: string | null | undefined;
  id: string;
  username: string;
  role: string;
  avatarPath?: string | null;
}

export async function fetchUserById(id: string): Promise<User | null> {
  try {
    const u = await get<User>(`/auth/users/${id}`);
    return u;
  } catch {
    return null;
  }
}
