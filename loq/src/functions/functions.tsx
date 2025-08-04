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

  while (redirectURL.startsWith("/")) redirectURL = redirectURL.substring(1);

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

export function blurActiveElement() {
  if (
    document.activeElement &&
    "blur" in document.activeElement &&
    typeof document.activeElement.blur === "function"
  )
    document.activeElement.blur();
}

export function splitArrayIntoChunks<T>(
  array: Array<T>,
  options:
    | {
        chunkSize: number;
      }
    | {
        chunkCount: number;
      }
) {
  const splitArray: Array<Array<T>> = [];
  const chunkSize =
    "chunkSize" in options
      ? options.chunkSize
      : Math.ceil(array.length / options.chunkCount);
  for (let i = 0; i < array.length; i += chunkSize) {
    const arrayChunk = [];
    for (let j = 0; j < chunkSize; j++) {
      if (i + j >= array.length) break;
      arrayChunk.push(array[i + j]);
    }
    splitArray.push(arrayChunk);
  }
  return splitArray;
}

export function plural(
  text: string,
  count: number = 0,
  suffix: string = "s",
  singularSuffix: string = ""
) {
  if (count === 1) return text + singularSuffix;
  return text + suffix;
}

export function timeout(ms: number) {
  return new Promise<void>((res) => {
    setTimeout(res, ms);
  });
}

export function shuffle<T>(arr: Array<T>) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function testUnorderedArrayEquality<T extends number>(
  arr1: Array<T>,
  arr2: Array<T>
) {
  if (arr1.length !== arr2.length) return false;
  arr1 = [...arr1];
  arr2 = [...arr2];
  arr1.sort((a, b) => a - b);
  arr2.sort((a, b) => a - b);
  return testOrderedArrayEquality(arr1, arr2);
}

export function testOrderedArrayEquality<T>(arr1: Array<T>, arr2: Array<T>) {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export function replaceAll(
  text: string,
  search: RegExp | string,
  replace: string
): string {
  if (typeof search === "string")
    return text
      .split(search)
      .filter((e) => e.length > 0)
      .join(replace);
  else
    return text
      .split(search)
      .filter((e) => e.length > 0 && !search.test(e))
      .join(replace);
}

export function fadeAudioOut(element: HTMLAudioElement, ms: number) {
  return new Promise<void>((res) => {
    const startingVolume = element.volume;
    const clear = setInterval(() => {
      console.log("Running interval")
      const newVolume = element.volume - startingVolume / 100;
      console.log("New volume", newVolume);
      if (newVolume > 0) element.volume = newVolume;
      else {
        element.volume = 0;
        element.pause();
        clearInterval(clear);
        res();
      }
    }, ms / 100);
  });
}

export function fadeAudioIn(element: HTMLAudioElement, ms: number) {
  return new Promise<void>((res) => {
    element.play();
    const startingVolume = element.volume;
    const clear = setInterval(() => {
      const newVolume = element.volume + (1 - startingVolume) / 100;
      if (newVolume < 1) element.volume = newVolume;
      else {
        element.volume = 1;
        clearInterval(clear);
        res();
      }
    }, ms / 100);
  });
}
