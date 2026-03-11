export async function loadDemoProofBundle() {
  const [metadataResponse, proofResponse] = await Promise.all([
    fetch("/grants_demo_metadata.json"),
    fetch("/grants_demo_full_calldata.txt")
  ]);

  if (!metadataResponse.ok) {
    throw new Error("Unable to load bundled grants demo metadata");
  }
  if (!proofResponse.ok) {
    throw new Error("Unable to load bundled grants demo proof calldata");
  }

  const metadata = await metadataResponse.json();
  const text = await proofResponse.text();
  const proofPoints = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return { ...metadata, proofPoints };
}
