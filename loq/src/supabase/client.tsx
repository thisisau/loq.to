import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const mode: "production" | "development" = false ? "production" : "development";

const supabase =
  mode === "production"
    ? createClient<Database>(
        "https://vavqqfurwxsmnyzuqjnt.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdnFxZnVyd3hzbW55enVxam50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzY2NzksImV4cCI6MjA2MTUxMjY3OX0.gwufkKr0D_9pIJWxNNgb7yAj3F1J_-eQWuE9KXEWs0U"
      )
    : createClient<Database>(
        "http://127.0.0.1:54321",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdnFxZnVyd3hzbW55enVxam50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzY2NzksImV4cCI6MjA2MTUxMjY3OX0.gwufkKr0D_9pIJWxNNgb7yAj3F1J_-eQWuE9KXEWs0U"
      );

export default supabase;
