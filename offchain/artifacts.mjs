import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "artifact-manifest.json");
const CACHE_ROOT = path.join(ROOT, ".artifacts");

function requiredArtifact(kind) {
  return ["wasm", "zkey", "verification_key"].includes(kind);
}

async function readManifest() {
  const raw = await fs.readFile(MANIFEST_PATH, "utf8");
  return JSON.parse(raw);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fetchToFile(url, outPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(outPath, Buffer.from(arrayBuffer));
}

export async function ensureUpstreamArtifacts(depth = 20) {
  const manifest = await readManifest();
  const version = manifest.upstream.artifact_version;
  const targetDir = path.join(CACHE_ROOT, "semaphore", version, String(depth));
  await ensureDir(targetDir);

  const result = {};

  for (const artifact of manifest.artifacts) {
    if (!requiredArtifact(artifact.kind)) {
      continue;
    }

    if (artifact.depth !== depth) {
      continue;
    }

    const extension =
      artifact.kind === "verification_key"
        ? "json"
        : artifact.kind;

    const localPath = path.join(targetDir, `${artifact.name}.${extension}`);

    try {
      await fs.access(localPath);
    } catch {
      await fetchToFile(artifact.url, localPath);
    }

    if (artifact.kind === "wasm") {
      result.wasm = localPath;
    } else if (artifact.kind === "zkey") {
      result.zkey = localPath;
    } else if (artifact.kind === "verification_key") {
      result.verificationKey = localPath;
    }
  }

  if (!result.wasm || !result.zkey || !result.verificationKey) {
    throw new Error(`Missing cached artifacts for depth ${depth}`);
  }

  return result;
}

export async function loadVerificationKey(depth = 20) {
  const artifacts = await ensureUpstreamArtifacts(depth);
  const raw = await fs.readFile(artifacts.verificationKey, "utf8");
  return JSON.parse(raw);
}
