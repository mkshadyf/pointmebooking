/*
  Utility function to fetch user profile with retry logic.
  It uses a Supabase client to query the 'profiles' table using the 'id' field and retries with exponential backoff if needed.
*/

export async function fetchProfileWithRetry(supabase: any, userId: string, retries = 3, delayMs = 300): Promise<{ data: any, error: any }> {
  let attempt = 0;
  while (attempt < retries) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      return { data, error: null };
    }
    attempt++;
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 2; // exponential backoff
    } else {
      return { data: null, error: error || new Error("Failed to fetch profile after retries") };
    }
  }
  return { data: null, error: new Error("Failed to fetch profile") };
} 