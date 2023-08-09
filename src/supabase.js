import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dfdskbcpiexuyhztmzpz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmZHNrYmNwaWV4dXloenRtenB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTEzMjg5MjYsImV4cCI6MjAwNjkwNDkyNn0.9rvC3111BJDaPAnZPlGEisVPRO5UtaoOlue5BMiLATQ";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
