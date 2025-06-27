import { Contents, Image } from "../pages/editor/editor.types";
import supabase from "../supabase/client";

export async function fetchLOQ(id: string | number) {
  if (isNaN(Number(id))) {
    return { data: null, error: null };
  }
  if (typeof id === "string") {
    id = Number(id);
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("contents")
    .eq("id", id);

  if (data !== null && data.length > 0) {
    return {
      data: data[0].contents as Contents,
      error: error,
    };
  }
  return { data: null, error };
}

export function getImageURL(image: Image, fallback: string = "/assets/tiles/purple.png"): string {
  return fallback;
}
