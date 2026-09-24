import { z } from "zod";

interface User {
  email: string;
  name: string;
}

export interface UserMessage extends User {
  message: string;
}

export interface DbMessage extends User {
  message: string[];
  count: number;
}

export const MessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().trim().email({ message: "Invalid email address." }),
  message: z
    .string()
    .trim()
    .min(3, { message: "Message must be at least 3 characters." }),
});
