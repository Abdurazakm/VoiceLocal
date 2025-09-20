import { z } from 'zod';

export const issueSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  location: z.string()
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location must be less than 100 characters'),
  category: z.string()
    .min(1, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high']),
  imageUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal(''))
});

export const commentSchema = z.object({
  content: z.string()
    .min(3, 'Comment must be at least 3 characters')
    .max(500, 'Comment must be less than 500 characters')
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const profileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  bio: z.string()
    .max(300, 'Bio must be less than 300 characters')
    .optional()
});

export type IssueFormData = z.infer<typeof issueSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
