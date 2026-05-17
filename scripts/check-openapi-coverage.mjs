import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const apiDir = path.join(repoRoot, "app", "api");
const openApiPath = path.join(repoRoot, "openapi.yaml");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath, files);
    } else if (entry.isFile() && entry.name === "route.ts") {
      files.push(entryPath);
    }
  }
  return files;
}

function routePathFromFile(filePath) {
  const rel = filePath.replace(apiDir, "").replace(/\\/g, "/").replace(/\/route\.ts$/, "");
  return `/api${rel}`.replace(/\[([^\]]+)\]/g, "{$1}");
}

function routeMethods(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const methods = [];
  for (const method of ["GET", "POST", "PATCH", "PUT", "DELETE"]) {
    if (new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`).test(text)) {
      methods.push(method.toLowerCase());
    }
  }
  return methods;
}

const openApiText = fs.readFileSync(openApiPath, "utf8");
const routeFiles = walk(apiDir);
const missing = [];

for (const file of routeFiles) {
  const routePath = routePathFromFile(file);
  const methods = routeMethods(file);

  if (!openApiText.includes(`  ${routePath}:`)) {
    missing.push(`${routePath} [${methods.join(", ")}]`);
    continue;
  }

  for (const method of methods) {
    const methodPattern = new RegExp(`\\n\\s{4}${method}:\\n`, "m");
    const routeBlockStart = openApiText.indexOf(`  ${routePath}:`);
    const nextRouteIndex = openApiText.indexOf("\n  /api", routeBlockStart + 1);
    const routeBlock =
      nextRouteIndex === -1
        ? openApiText.slice(routeBlockStart)
        : openApiText.slice(routeBlockStart, nextRouteIndex);

    if (!methodPattern.test(routeBlock)) {
      missing.push(`${routePath} [${method}]`);
    }
  }
}

if (missing.length > 0) {
  process.stderr.write("OpenAPI coverage check failed:\n");
  for (const item of missing) {
    process.stderr.write(`- Missing in openapi.yaml: ${item}\n`);
  }
  process.exit(1);
}

process.stdout.write("OpenAPI coverage check passed.\n");

