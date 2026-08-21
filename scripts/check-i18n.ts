import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const locales = ['bn', 'en'] as const

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type LeafMap = Map<string, string>

function flatten(value: JsonValue, prefix = '', output: LeafMap = new Map()) {
  if (typeof value === 'string') {
    output.set(prefix, value)
    return output
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, output)
    }
  }
  return output
}

function placeholders(value: string) {
  return [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)]
    .map((match) => match[1])
    .sort()
}

async function load(locale: string) {
  const text = await readFile(
    resolve(root, 'messages', `${locale}.json`),
    'utf8',
  )
  return flatten(JSON.parse(text) as JsonValue)
}

async function main() {
  const catalogs = Object.fromEntries(
    await Promise.all(
      locales.map(async (locale) => [locale, await load(locale)]),
    ),
  ) as Record<string, LeafMap>
  const reference = catalogs.en
  const errors: string[] = []

  for (const locale of locales) {
    const catalog = catalogs[locale]
    for (const key of reference.keys()) {
      if (!catalog.has(key)) errors.push(`${locale}: missing ${key}`)
    }
    for (const key of catalog.keys()) {
      if (!reference.has(key)) errors.push(`${locale}: extra ${key}`)
    }
    for (const [key, english] of reference) {
      const translated = catalog.get(key)
      if (!translated || !translated.trim())
        errors.push(`${locale}: blank ${key}`)
      if (translated && translated.includes('\uFFFD'))
        errors.push(`${locale}: corrupted replacement character ${key}`)
      if (
        translated &&
        JSON.stringify(placeholders(english)) !==
          JSON.stringify(placeholders(translated))
      ) {
        errors.push(`${locale}: interpolation mismatch ${key}`)
      }
    }
  }

  if (errors.length) {
    console.error(`i18n validation failed with ${errors.length} issue(s):`)
    for (const error of errors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log(
    `i18n validation passed: ${reference.size} keys across ${locales.length} locales`,
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
