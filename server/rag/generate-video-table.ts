import { clinicVideoUrls } from "../../composables/useClinicVideos";

type VideoRow = {
  url: string
  title: string
  desc: string
  shortDesc: string
  categoriesBySlug: string[]
  categoriesInHebrow: string[]
};

const cleanText = (value: string): string => value.replace(/\s+/g, " ").trim();

const makeShortDesc = (description: string): string => {
  const normalized = cleanText(description);
  if (!normalized) {
    return "";
  }

  const firstSentence = normalized.split(/[.!?]/).find((part) => part.trim())?.trim() || normalized;
  return firstSentence.length > 140 ? `${firstSentence.slice(0, 137)}...` : firstSentence;
};

const fetchMetadata = async (url: string): Promise<{ title: string; desc: string }> => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  const html = await response.text();
  const dataMatch = html.match(/var ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/);

  if (!dataMatch) {
    return { title: "", desc: "" };
  }

  const data = JSON.parse(dataMatch[1]);
  const title = String(data?.videoDetails?.title || "").trim();
  const desc = String(data?.videoDetails?.shortDescription || "").trim();

  return { title, desc };
};

const run = async (): Promise<void> => {
  const rows: VideoRow[] = [];

  for (const url of clinicVideoUrls) {
    const { title, desc } = await fetchMetadata(url);

    rows.push({
      url,
      title,
      desc,
      shortDesc: makeShortDesc(desc),
      categoriesBySlug: ["general"],
      categoriesInHebrow: ["כללי"],
    });
  }

  const tableText = `export const clinicVideoTable: ClinicVideoRow[] = ${JSON.stringify(rows, null, 2)};`;
  console.log(tableText);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
