export const copyToClipboard = (artist: string | null, title: string | null): void => {
  if (!artist && !title) return;

  const formattedArtist = artist || "Unknown Artist";
  const formattedTitle = title || "Unknown Title";
  const textToCopy = `${formattedArtist} - ${formattedTitle}`;

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      console.log("Copied to clipboard:", textToCopy);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};
