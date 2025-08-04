import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const mode: "production" | "development" = true ? "production" : "development";

const url =
  mode === "production"
    ? "https://vavqqfurwxsmnyzuqjnt.supabase.co"
    : "http://127.0.0.1:54321";
const key =
  mode === "production"
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdnFxZnVyd3hzbW55enVxam50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzY2NzksImV4cCI6MjA2MTUxMjY3OX0.gwufkKr0D_9pIJWxNNgb7yAj3F1J_-eQWuE9KXEWs0U"
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const host = window.location.hostname;

if (host === "www.loq.to") window.location.href = "https://loq.to/";
else if (host === "play.loq.to") window.location.href = "https://loq.to/play/";

const supabase = createClient<Database>(
  url,
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdnFxZnVyd3hzbW55enVxam50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzY2NzksImV4cCI6MjA2MTUxMjY3OX0.gwufkKr0D_9pIJWxNNgb7yAj3F1J_-eQWuE9KXEWs0U"
  key
);

export default supabase;
