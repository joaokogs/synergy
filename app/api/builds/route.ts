import { NextResponse } from "next/server";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemon = searchParams.get("pokemon");
  const tier = searchParams.get("tier");

  const buildsDir = join(process.cwd(), "builds");

  if (!existsSync(buildsDir)) {
    return NextResponse.json([]);
  }

  if (pokemon) {
    const pokemonDir = join(buildsDir, pokemon);
    if (!existsSync(pokemonDir)) {
      return NextResponse.json([]);
    }

    const files = readdirSync(pokemonDir).filter((f) => f.endsWith(".json"));
    let builds = files.map((file) => {
      const content = readFileSync(join(pokemonDir, file), "utf-8");
      return JSON.parse(content);
    });

    if (tier) {
      builds = builds.filter((b: { tier?: string }) => b.tier === tier);
    }

    return NextResponse.json(builds);
  }

  const pokemonDirs = readdirSync(buildsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const allBuilds: Record<string, unknown[]> = {};
  for (const dir of pokemonDirs) {
    const dirPath = join(buildsDir, dir);
    const files = readdirSync(dirPath).filter((f) => f.endsWith(".json"));
    let builds = files.map((file) => {
      const content = readFileSync(join(dirPath, file), "utf-8");
      return JSON.parse(content);
    });

    if (tier) {
      builds = builds.filter((b: { tier?: string }) => b.tier === tier);
    }

    if (builds.length > 0) {
      allBuilds[dir] = builds;
    }
  }

  return NextResponse.json(allBuilds);
}
