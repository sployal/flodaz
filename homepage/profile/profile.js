const SUPABASE_URL = 'https://hrfvkblkpihdzcuodwzz.supabase.co';
const SUPABASE_ANON_KEY = 'your_anon_key_here'; // replace with your actual key

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testEmailLookup() {
  const testEmail = 'muigaid91@gmail.com';
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('*')
    .eq('email', testEmail)
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('User profile:', data);
  }
}

testEmailLookup();
