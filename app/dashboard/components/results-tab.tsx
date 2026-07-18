'use client'

import type { ExamSubmission } from './types'

export function ResultsTable({
  examSubmissions,
}: {
  examSubmissions: ExamSubmission[]
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                পরীক্ষা
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                তারিখ
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                স্কোর
              </th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">
                পারফরম্যান্স
              </th>
            </tr>
          </thead>
          <tbody>
            {examSubmissions.map((r) => {
              const pct =
                r.total > 0 ? Math.round((r.score / r.total) * 100) : 0
              return (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {r.examTitle || 'পরীক্ষা'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-foreground">
                    {r.score}/{r.total}
                  </td>
                  <td className="px-4 py-3">
                    <div className="mx-auto flex w-full max-w-[100px] items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80
                              ? 'bg-green'
                              : pct >= 60
                                ? 'bg-brand'
                                : 'bg-gold'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
            {examSubmissions.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  কোনো ফলাফল নেই
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
