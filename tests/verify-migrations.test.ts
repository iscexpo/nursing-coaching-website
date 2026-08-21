import { describe, it, expect } from 'vitest'

type JournalEntry = { idx: number; tag: string }

function validate(fileTags: string[], journalEntries: JournalEntry[]) {
  const journalTags = journalEntries.map((e) => e.tag)
  const errors: string[] = []
  for (let index = 0; index < journalEntries.length; index += 1) {
    if (journalEntries[index].idx !== index) errors.push(`journal index mismatch at ${journalEntries[index].tag}`)
    if (journalTags[index] !== fileTags[index]) errors.push(`journal order mismatch at index ${index}: expected ${fileTags[index] ?? 'none'}, got ${journalTags[index]}`)
  }
  return errors
}

describe('verify-migrations order validation', () => {
  const fileTags = ['0000_init', '0001_add_users', '0002_add_courses']

  it('passes when journal order matches filesystem order', () => {
    const entries: JournalEntry[] = fileTags.map((tag, idx) => ({ idx, tag }))
    expect(validate(fileTags, entries)).toEqual([])
  })

  it('detects reordered journal entries even when idx values are sequential', () => {
    // Reordered: 0002 swapped with 0001, but idx fields remain 0,1,2
    const reordered: JournalEntry[] = [
      { idx: 0, tag: '0000_init' },
      { idx: 1, tag: '0002_add_courses' },
      { idx: 2, tag: '0001_add_users' },
    ]
    const errors = validate(fileTags, reordered)
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('journal order mismatch at index 1: expected 0001_add_users, got 0002_add_courses'),
      ])
    )
    // Should report mismatch at index 1 (and 2) but not idx mismatch since idx are sequential
    expect(errors.some((e) => e.includes('journal index mismatch'))).toBe(false)
  })

  it('preserves idx mismatch reporting', () => {
    const badIdx: JournalEntry[] = [
      { idx: 0, tag: '0000_init' },
      { idx: 5, tag: '0001_add_users' },
      { idx: 2, tag: '0002_add_courses' },
    ]
    const errors = validate(fileTags, badIdx)
    expect(errors).toEqual(expect.arrayContaining([expect.stringContaining('journal index mismatch at 0001_add_users')]))
  })
})
