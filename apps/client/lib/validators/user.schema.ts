import { z } from 'zod';

export const updateProfileSchema = z.object({
    name: z.string().min(4, 'Name must be at least 4 characters').max(20),

});

export type UpdateProfileInputs = z.infer<typeof updateProfileSchema>;