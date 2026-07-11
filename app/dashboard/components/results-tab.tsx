'use client'

import type { MockResult } from './types'

export function ResultsTable({ results }: { results: MockResult[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">পরীক্ষা</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">তারিখ</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">স্কোর</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">র‍্যাঙ্ক</th>
              <th className="px-4 py-3 text-center font-semibold text-foreground">পারফরম্যান্স</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const pct = Math.round((r.score / r.total) * 100)
              return (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{r.exam}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 text-center font-bold text-foreground">{r.score}/{r.total}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.rank <= 5 ? 'bg-green/10 text-green' : r.rank <= 15 ? 'bg-brand/10 text-brand' : 'bg-secondary text-muted-foreground'
                    }`}>
                      #{r.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mx-auto flex w-full max-w-[100px] items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80 ? 'bg-green' : pct >= 60 ? 'bg-brand' : 'bg-gold'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
