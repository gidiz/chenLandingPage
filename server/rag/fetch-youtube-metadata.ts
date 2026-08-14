const url = process.argv[2];

if (!url) {
  console.error("Missing URL argument");
  process.exit(1);
}

const run = async (): Promise<void> => {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-US,en;q=0.9",
    },
  });

  const html = await response.text();
  const dataMatch = html.match(/var ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\});/);

  if (!dataMatch) {
    console.log(JSON.stringify({ title: "", desc: "" }));
    return;
  }

  const data = JSON.parse(dataMatch[1]);
  const title = data?.videoDetails?.title || "";
  const desc = data?.videoDetails?.shortDescription || "";

  console.log(JSON.stringify({ title, desc }));
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exit(1);
});
