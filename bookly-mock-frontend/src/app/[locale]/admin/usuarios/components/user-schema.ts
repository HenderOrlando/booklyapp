import { UserStatus } from "@/types/entities/user";
import { z } from "zod";

/**
 * Schema para creación de usuario
 */
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phoneNumber: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  programId: z.string().optional(),
  coordinatedProgramId: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
});

/**
 * Schema para actualización de usuario
 */
export const updateUserSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres").optional(),
  phoneNumber: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  programId: z.string().optional(),
  coordinatedProgramId: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol").optional(),
});

/**
 * Tipo para los valores del formulario que cubre ambos casos (creación y edición)
 */
export const userFormSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").optional(),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
  phoneNumber: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  programId: z.string().optional(),
  coordinatedProgramId: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
