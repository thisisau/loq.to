import { ClassArray } from "./types";

export function concatClasses(...classes: ClassArray): string {
  return classes
    .filter((e) => e !== undefined && e !== null && e !== false)
    .map<string>((e) => {
      if (typeof e === "object") e = concatClasses(e);
      else e = e.trim();
      return e;
    })
    .join(" ")
    .trim();
}

export function getRedirect(
  locationURL = window.location,
  defaultRedirect = "/"
) {
  const redirect = new URLSearchParams(locationURL.search).get("redirect");
  if (!redirect) return defaultRedirect;
  let redirectURL = decodeURIComponent(redirect);
  console.log("REDIRECT URL IS", redirectURL);

  while (redirectURL.startsWith("/")) redirectURL = redirectURL.substring(1);

  console.log("REDIRECT URL IS", redirectURL);
  return `${locationURL.protocol}//${locationURL.host}/${redirectURL}`;
}

export function getYoutubeVideoID(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}

export function formatDate(
  date: Date,
  mode: "short-adapt" | "long" | "very-long"
) {
  const shortMonthKey = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const shortDayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const longMonthKey = [
    "January",
    "February",
    "March",
    "May",
    "April",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const longDayKey = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const d = date.getDay();
  const D = date.getDate();
  const M = date.getMonth();
  const Y = date.getFullYear();
  const now = new Date();
  const DAY_IN_MS = 1000 * 60 * 60 * 24;
  const WEEK_IN_MS = DAY_IN_MS * 7;

  switch (mode) {
    case "short-adapt":
      // Date is same day as current time
      if (now.getDate() - DAY_IN_MS < date.getTime() && D === now.getDate()) {
        return `${h % 12 === 0 ? 12 : h % 12}:${m
          .toString()
          .padStart(2, "0")} ${h / 12 < 1 ? "AM" : "PM"}`;
      }

      // Date is within 1 week of current time
      else if (now.getTime() - WEEK_IN_MS < date.getTime()) {
        return shortDayKey[d];
      }

      // Date is same year as current time
      else if (now.getFullYear() === Y) {
        return `${shortMonthKey[M]} ${d}`;
      }

      // Default case
      else {
        return `${Y}-${M}-${D}`;
      }
    case "long":
      return `${longMonthKey[M]} ${D}, ${Y} at ${h % 12 === 0 ? 12 : h % 12}:${m
        .toString()
        .padStart(2, "0")} ${h / 12 < 1 ? "AM" : "PM"}`;
    case "very-long":
      return `${longDayKey[d]}, ${longMonthKey[M]} ${D}, ${Y} at ${
        h % 12 === 0 ? 12 : h % 12
      }:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} ${
        h / 12 < 1 ? "AM" : "PM"
      }`;
  }
}
