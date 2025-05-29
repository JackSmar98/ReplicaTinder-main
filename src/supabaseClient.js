// replica-tinder-frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztuexxjwdsvsssgmhyju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0dWV4eGp3ZHN2c3NzZ21oeWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODE3MTMsImV4cCI6MjA2NDA1NzcxM30.U60DIbbO0pJlZR2rjYKK9WinHZ_uPc708oP2rPF65RI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);