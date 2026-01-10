// @ts-ignore
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://btimnibnsoeotkomayte.supabase.co";
const supabaseKey = 
  (import.meta.env.SUPABASE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string);
export const supabase = createClient(supabaseUrl, supabaseKey);

