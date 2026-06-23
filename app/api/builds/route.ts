import { NextResponse } from "next/server";
import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
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

export async function POST(request: Request) {
  const body = await request.json();
  const { pokemon, team } = body;

  if (!pokemon || !team) {
    return NextResponse.json({ error: "pokemon and team are required" }, { status: 400 });
  }

  const sanitizedTeam = team.replace(/[^a-zA-Z0-9 _-]/g, "");
  if (!sanitizedTeam) {
    return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
  }

  const buildsDir = join(process.cwd(), "builds", pokemon);

  if (!existsSync(buildsDir)) {
    mkdirSync(buildsDir, { recursive: true });
  }

  const filePath = join(buildsDir, `${sanitizedTeam}.json`);
  if (existsSync(filePath)) {
    return NextResponse.json({ error: "Uma build com esse nome já existe" }, { status: 409 });
  }

  writeFileSync(filePath, JSON.stringify({ ...body, team: sanitizedTeam }, null, 2));
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { pokemon, team, originalTeam } = body;

  if (!pokemon || !team) {
    return NextResponse.json({ error: "pokemon and team are required" }, { status: 400 });
  }

  const sanitizedTeam = team.replace(/[^a-zA-Z0-9 _-]/g, "");
  if (!sanitizedTeam) {
    return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
  }

  const buildsDir = join(process.cwd(), "builds", pokemon);

  if (originalTeam && originalTeam !== sanitizedTeam) {
    const oldPath = join(buildsDir, `${originalTeam}.json`);
    if (existsSync(oldPath)) {
      unlinkSync(oldPath);
    }
  }

  if (!existsSync(buildsDir)) {
    mkdirSync(buildsDir, { recursive: true });
  }

  const filePath = join(buildsDir, `${sanitizedTeam}.json`);
  writeFileSync(filePath, JSON.stringify({ ...body, team: sanitizedTeam }, null, 2));
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const pokemon = searchParams.get("pokemon");
  const team = searchParams.get("team");

  if (!pokemon || !team) {
    return NextResponse.json({ error: "pokemon and team are required" }, { status: 400 });
  }

  const filePath = join(process.cwd(), "builds", pokemon, `${team}.json`);
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Build não encontrada" }, { status: 404 });
  }

  unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
