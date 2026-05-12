export const SITE_NAME = "InsideKoreaNow";
export const SITE_URL = "https://insidekoreanow.com";

export const SITE_DESCRIPTION =
  "Korea travel, food, culture, and living guides for international visitors, written like a local friend is helping you.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
