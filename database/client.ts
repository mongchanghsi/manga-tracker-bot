import { createClient } from "@supabase/supabase-js";
import ENVIRONMENT from "../configuration/environment";
import { Database } from "./types";

const getSupabaseClient = createClient<Database>(
  ENVIRONMENT.DATABASE_URL,
  ENVIRONMENT.DATABASE_KEY
);

export default getSupabaseClient;
