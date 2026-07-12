import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site-data'
import { db } from '@/lib/db'
import { courses, notices } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const STATIC_ROUTES = [
  '',
  '/courses',
  '/admission',
  '/notice',
  '/model-test',
  '/gallery',
  '/contact',
  '/exam',
  '/auth/sign-in',
  '/auth/sign-up',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  let courseEntries: MetadataRoute.Sitemap = []
  let noticeEntries: MetadataRoute.Sitemap = []

  try {
    const activeCourses = await db
      .select({ slug: courses.slug, updatedAt: courses.updatedAt })
      .from(courses)
      .where(eq(courses.isActive, true))

    courseEntries = activeCourses.map((c) => ({
      url: `${SITE.url}/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    // DB unreachable — omit dynamic entries
  }

  try {
    const publishedNotices = await db
      .select({ id: notices.id, updatedAt: notices.updatedAt })
      .from(notices)
      .where(eq(notices.isPublished, true))

    noticeEntries = publishedNotices.map((n) => ({
      url: `${SITE.url}/notice/${n.id}`,
      lastModified: n.updatedAt,
      changeFrequency: 'daily',
      priority: 0.6,
    }))
  } catch {
    // DB unreachable — omit dynamic entries
  }

  return [...staticEntries, ...courseEntries, ...noticeEntries]
}
