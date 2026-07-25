import { z } from 'zod'
import { isTodayOrFuture } from '../utils/date'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(2, 'Department is required'),
  designation: z.string().min(2, 'Designation is required'),
  phone: z.string().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().min(1, 'Due date is required').refine(isTodayOrFuture, 'Due date cannot be in the past'),
  estimatedHours: z.coerce.number().min(0),
  assignedTo: z.string().min(1, 'Choose an employee'),
})

export const leaveSchema = z.object({
  type: z.enum(['Casual', 'Sick', 'Earned', 'Unpaid']),
  fromDate: z.string().min(1, 'From date is required').refine(isTodayOrFuture, 'Leave cannot start in the past'),
  toDate: z.string().min(1, 'To date is required').refine(isTodayOrFuture, 'Leave cannot end in the past'),
  reason: z.string().min(5, 'Reason is required'),
}).refine(({ fromDate, toDate }) => !fromDate || !toDate || toDate >= fromDate, { message: 'To date must be on or after from date', path: ['toDate'] })

export const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})
