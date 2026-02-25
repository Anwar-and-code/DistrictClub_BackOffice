import { z } from "zod";

export const clientSchema = z.object({
  full_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  phone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .regex(/^[0-9+\s-]+$/, "Format de téléphone invalide"),
});

export const reservationSchema = z.object({
  terrain_id: z.number().positive("Veuillez sélectionner un terrain"),
  time_slot_id: z.number().positive("Veuillez sélectionner un créneau"),
  reservation_date: z.string().min(1, "Veuillez sélectionner une date"),
  client_id: z.string().optional().nullable(),
});

export const transactionSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["reservation", "product", "service"]),
        name: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1, "Le panier ne peut pas être vide"),
  client_id: z.string().optional().nullable(),
  payment_method: z.enum(["cash", "card", "transfer", "mixed"]),
  discount: z.number().nonnegative().default(0),
  discount_type: z.enum(["percentage", "fixed"]).default("percentage"),
  notes: z.string().optional(),
});

export const employeeLoginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(4, "Le mot de passe doit contenir au moins 4 caractères"),
});

export const timeSlotSchema = z.object({
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide (HH:MM)"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Format invalide (HH:MM)"),
  price: z.number().positive("Le prix doit être positif"),
  is_active: z.boolean().default(true),
});

export const terrainSchema = z.object({
  code: z
    .string()
    .min(1, "Le code est requis")
    .max(10, "Le code ne peut pas dépasser 10 caractères"),
  is_active: z.boolean().default(true),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type EmployeeLoginFormData = z.infer<typeof employeeLoginSchema>;
export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;
export type TerrainFormData = z.infer<typeof terrainSchema>;

export const eventSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  subtitle: z.string().optional().nullable(),
  description: z
    .string()
    .min(1, "La description est requise"),
  long_description: z.string().optional().nullable(),
  category: z.enum(["TOURNOI", "FORMATION", "SOCIAL", "ANIMATION", "COMPETITION", "AUTRE"], {
    message: "La catégorie est requise",
  }),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"], {
    message: "Le statut est requis",
  }),
  start_date: z.string().min(1, "La date de début est requise"),
  end_date: z.string().optional().nullable(),
  location: z
    .string()
    .min(1, "Le lieu est requis"),
  cover_image_url: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().optional(),
  tags: z.array(z.string()).optional().nullable(),
  price_info: z.string().optional().nullable(),
  is_free: z.boolean().optional(),
  contact_phone: z.string().optional().nullable(),
});

export type EventFormData = z.infer<typeof eventSchema>;
