/*
  Utility validator for business profiles.
  Returns true if the profile has all required business fields.
*/

export function validateBusinessProfile(profile: any): boolean {
  if (!profile) return false;
  // Validate required fields for a business profile
  return Boolean(
    profile.business_name && 
    profile.business_category && 
    profile.business_type && 
    profile.description && 
    profile.location
  );
} 