import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  user_id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  height_meter: z.number(),
  weight_kilogram: z.number(),
  max_heart_rate: z.number()
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

export async function fetchPersonalInfo(baseUrl: string, headers: Record<string, string>): Promise<PersonalInfo> {
  // Fetch both profile and body measurement data
  const [profileResponse, bodyResponse] = await Promise.all([
    fetch(`${baseUrl}/v1/user/profile/basic`, { headers }),
    fetch(`${baseUrl}/v1/user/measurement/body`, { headers })
  ]);

  if (!profileResponse.ok || !bodyResponse.ok) {
    throw new Error('Failed to fetch personal info');
  }

  const profile = await profileResponse.json();
  const body = await bodyResponse.json();

  // Combine the data into a single object
  return {
    user_id: profile.user_id,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    height_meter: body.height_meter,
    weight_kilogram: body.weight_kilogram,
    max_heart_rate: body.max_heart_rate
  };
} 