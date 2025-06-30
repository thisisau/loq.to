import { Contents, Image, LOQ } from "../pages/editor/editor.types";
import supabase from "../supabase/client";

export async function fetchLOQContents(id: string | number) {
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

export async function fetchLOQ(id: string | number) {
  if (isNaN(Number(id))) {
    return { data: null, error: null };
  }
  if (typeof id === "string") {
    id = Number(id);
  }

  const { data, error } = await supabase.from("quizzes").select().eq("id", id);

  if (data !== null && data.length > 0) {
    const loqData = data[0];
    return {
      data: {
        id: loqData.id,
        title: loqData.title,
        description: loqData.quiz_description,
        contents: loqData.contents,
        interactions: loqData.interactions,
        likes: loqData.likes,
        createdAt: new Date(loqData.created_at),
        lastUpdated: new Date(loqData.last_updated),
        lastUsed: loqData.last_used === null ? null : loqData.last_used,
        visibility: loqData.visibility,
        copyProtect: loqData.copy_protect,
        author: loqData.author,
        thumbnail: loqData.thumbnail,
      } as LOQ,
      error: error,
    };
  }
  return { data: null, error };
}

export function getImageURL(
  image: Image,
  fallback: string = "/assets/tiles/purple.png"
): string {
  return fallback;
}
