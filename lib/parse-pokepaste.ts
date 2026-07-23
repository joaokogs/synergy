export interface ParsedPokemon {
  name: string
  item: string | null
  ability: string | null
  teraType: string | null
  nature: string | null
  level: number
  evs: Record<string, number>
  ivs: Record<string, number>
  moves: string[]
}

const STAT_ALIASES: Record<string, string> = {
  hp: "hp",
  atk: "atk",
  attack: "atk",
  def: "def",
  defense: "def",
  spa: "spa",
  "sp.atk": "spa",
  "special-attack": "spa",
  spd: "spd",
  "sp.def": "spd",
  "special-defense": "spd",
  spe: "spe",
  speed: "spe",
}

function toId(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "-")
}

function parseStatLine(text: string): Record<string, number> {
  const stats: Record<string, number> = {}
  const parts = text.split("/")
  for (const part of parts) {
    const match = part.trim().match(/^(\d+)\s+(.+)$/)
    if (match) {
      const key = STAT_ALIASES[match[2].toLowerCase().trim()]
      if (key) stats[key] = Number.parseInt(match[1], 10)
    }
  }
  return stats
}

export function parsePokepaste(text: string): ParsedPokemon[] {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim())
  const results: ParsedPokemon[] = []

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l)
    if (lines.length === 0) continue

    const pokemon: ParsedPokemon = {
      name: "",
      item: null,
      ability: null,
      teraType: null,
      nature: null,
      level: 50,
      evs: {},
      ivs: {},
      moves: [],
    }

    for (const line of lines) {
      if (line.startsWith("-")) {
        const move = line.replace(/^-/, "").trim()
        if (move) pokemon.moves.push(toId(move))
        continue
      }

      if (line.includes("@")) {
        const [name, itemPart] = line.split("@")
        pokemon.name = toId(name)
        pokemon.item = toId(itemPart)
        continue
      }

      if (!pokemon.name) {
        pokemon.name = toId(line)
        continue
      }

      const lower = line.toLowerCase()

      if (lower.startsWith("ability:")) {
        pokemon.ability = toId(line.replace(/^ability:\s*/i, ""))
        continue
      }

      if (lower.startsWith("tera type:")) {
        pokemon.teraType = line.replace(/^tera type:\s*/i, "").trim().toLowerCase()
        continue
      }

      if (lower.startsWith("tera:")) {
        pokemon.teraType = line.replace(/^tera:\s*/i, "").trim().toLowerCase()
        continue
      }

      if (lower.startsWith("evs:")) {
        const evText = line.replace(/^evs:\s*/i, "").trim()
        pokemon.evs = parseStatLine(evText)
        continue
      }

      if (lower.startsWith("ivs:")) {
        const ivText = line.replace(/^ivs:\s*/i, "").trim()
        pokemon.ivs = parseStatLine(ivText)
        continue
      }

      if (lower.startsWith("level:")) {
        const levelMatch = line.match(/\d+/)
        if (levelMatch) pokemon.level = Number.parseInt(levelMatch[0], 10)
        continue
      }

      if (lower.endsWith("nature")) {
        const raw = line.replace(/\s*nature$/i, "").trim()
        pokemon.nature = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
        continue
      }

      if (lower.startsWith("shiny:")) {
        continue
      }

      if (lower.startsWith("happiness:")) {
        continue
      }
    }

    if (pokemon.name) {
      results.push(pokemon)
    }
  }

  return results
}
