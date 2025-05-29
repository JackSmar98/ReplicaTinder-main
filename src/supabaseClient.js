// replica-tinder-frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Tus credenciales de Supabase (las que me proporcionaste)
const supabaseUrl = 'https://cvtkarxewrqjcftkiwpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dGthcnhld3JxamNmdGtpd3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzOTc5OTIsImV4cCI6MjA2Mzk3Mzk5Mn0.mlJIG6ksZNPiBuHXb47o6odsTU25XCq-bD-bKomO3LQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);