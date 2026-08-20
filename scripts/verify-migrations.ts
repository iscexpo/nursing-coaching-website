import { readFile } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

type JournalEntry = { idx: number; tag: string }
type Journal = { entries: JournalEntry[] }

async function main() {
  const migrationsDir = resolve(process.cwd(), 'lib/db/migrations')
  const metaPath = resolve(migrationsDir, 'meta/_journal.json')
  const journal = JSON.parse(await readFile(metaPath, 'utf8')) as Journal
  const files = (await readdir(migrationsDir)).filter((file) => /^\d{4}_.+\.sql$/.test(file)).sort()
  const fileTags = files.map((file) => file.replace(/\.sql$/, ''))
  const journalTags = journal.entries.map((entry) => entry.tag)
  const errors: string[] = []

  if (new Set(fileTags).size !== fileTags.length) errors.push('duplicate migration filenames detected')
  if (new Set(journalTags).size !== journalTags.length) errors.push('duplicate migration journal tags detected')

  for (const tag of fileTags) {
    if (!journalTags.includes(tag)) errors.push(`migration file missing from journal: ${tag}`)
  }
  for (const tag of journalTags) {
    if (!fileTags.includes(tag)) errors.push(`journal entry missing migration file: ${tag}`)
  }
  for (let index = 0; index < journal.entries.length; index += 1) {
    if (journal.entries[index].idx !== index) errors.push(`journal index mismatch at ${journal.entries[index].tag}`)
  }

  if (errors.length) {
    console.error(`migration verification failed with ${errors.length} issue(s):`)
    for (const error of errors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log(`migration verification passed: ${files.length} SQL files and ${journal.entries.length} journal entries`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
