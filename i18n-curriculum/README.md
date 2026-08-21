# i18n-curriculum

Curriculum-specific translations extracted from monolithic `messages/{en,bn}.json` into dedicated `curriculum` namespace.

- **Source:** `messages/en.json:curriculum` / `messages/bn.json:curriculum` (validated via `pnpm i18n:check` — 1456 keys)
- **Config:** `i18n/curriculum.ts` (slugs, subject names, course slugs, helpers)
- **Helpers:** `lib/i18n/curriculum.ts` (`useCurriculumTranslations`, `translateSubject`/`translateCategory`/`translateCourse`, `getSubjectLabel`, `curriculumSubjectOptions`)
- **Seed:** `scripts/data/isc/*` (categories, subjects, courses, teachers) — display via `t('curriculum.subjects.Physics')` etc.

**Refactoring:** `i18n` → `i18n-curriculum` isolates ISC track (category `isc` vs `icon`, 8 subjects, 3 courses) from general `i18n/config.ts:37` `messageNamespaces`. `i18n/config.ts:37` now includes `curriculum` in `messageNamespaces` and `curriculumNamespaces`.

Usage:

```tsx
import { useCurriculumTranslations, translateSubject } from '@/lib/i18n/curriculum'

function SubjectBadge({ name }: { name: string }) {
  const t = useCurriculumTranslations()
  return <span>{translateSubject(t, name)}</span>
}

// Pure (seed, PDF)
import { getSubjectLabel } from '@/lib/i18n/curriculum'
getSubjectLabel('Physics', 'bn') // → 'পদার্থবিজ্ঞান'
```
