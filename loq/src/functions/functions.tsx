import { ClassArray } from "./types";

export function concatClasses(...classes: ClassArray): string {
  return classes
    .filter((e) => e !== undefined && e !== null && e !== false)
    .map<string>((e) => {
      if (typeof e === "object") e = concatClasses(e);
      else e = e.trim();
      return e;
    })
    .join(" ");
}

export function getRedirect(
  locationURL = window.location,
  defaultRedirect = "/"
) {
  const redirect = new URLSearchParams(locationURL.search).get("redirect");
  if (!redirect) return defaultRedirect;
  return `${locationURL.protocol}//${locationURL.host}/${decodeURIComponent(
    redirect
  )}`;
}

export function getYoutubeVideoID(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  console.log(url);
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}