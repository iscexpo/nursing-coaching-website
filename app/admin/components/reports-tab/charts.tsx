'use client'

import { useTranslations } from 'next-intl'
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type {
  EnrollmentTrend,
  RevenueReport,
  AttendanceStats,
  CourseAnalytics,
  StudentPerformance,
} from '../types'

const BRAND_COLOR = '#0070f3'
const GREEN_COLOR = 'var(--green, #50e3c2)'
const GOLD_COLOR = 'var(--gold, #f5a623)'
const DESTRUCTIVE_COLOR = '#ef4444'
const GRID_COLOR = 'var(--border, #eaeaea)'
const TICK_COLOR = 'var(--muted-foreground, #666666)'

const chartTooltipStyle = {
  borderRadius: '0.75rem',
  border: '1px solid var(--border, #eaeaea)',
  fontSize: '0.75rem',
  background: 'var(--card, #ffffff)',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand/10 text-brand',
    green: 'bg-green/10 text-green',
    gold: 'bg-gold/15 text-gold',
    red: 'bg-destructive/10 text-destructive',
    blue: 'bg-blue-500/10 text-blue-500',
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-11 items-center justify-center rounded-xl ${colorMap[color]}`}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

export function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h4 className="font-heading font-semibold text-foreground mb-4">
        {title}
      </h4>
      {children}
    </div>
  )
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  const t = useTranslations('admin.reports')
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 transition-colors hover:bg-secondary/50"
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t('noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function BarChart({
  data,
  xKey,
  yKey,
}: {
  data: object[]
  xKey: string
  yKey: string
}) {
  if (data.length === 0) {
    const t = useTranslations('admin.reports')
    return <p className="text-center text-muted-foreground py-8">{t('noData')}</p>
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: TICK_COLOR }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: TICK_COLOR }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Bar dataKey={yKey} fill={BRAND_COLOR} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RevenueChart({ data }: { data: RevenueReport[] }) {
  const t = useTranslations('admin.reports')
  if (data.length === 0)
    return <p className="text-center text-muted-foreground py-8">{t('noData')}</p>
  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 12, fill: TICK_COLOR }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: TICK_COLOR }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="verified" name={t('dataTableHeaders.verified')} stackId="a" fill={GREEN_COLOR} radius={[0, 0, 0, 0]} />
            <Bar dataKey="pending" name={t('dataTableHeaders.pending')} stackId="a" fill={GOLD_COLOR} radius={[6, 6, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green" />{' '}
          {t('dataTableHeaders.verified')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gold" />{' '}
          {t('dataTableHeaders.pending')}
        </span>
      </div>
    </div>
  )
}

export function AttendanceChart({ data }: { data: AttendanceStats[] }) {
  const t = useTranslations('admin.reports')
  if (data.length === 0)
    return <p className="text-center text-muted-foreground py-8">{t('noData')}</p>
  const present = data.reduce((s, d) => s + d.present + d.late, 0)
  const late = data.reduce((s, d) => s + d.late, 0)
  const absent = data.reduce((s, d) => s + d.absent, 0)
  const total = present + absent
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0

  const pieData = [
    { name: t('attendancePresent'), value: present, color: GREEN_COLOR },
    { name: t('attendanceLate'), value: late, color: GOLD_COLOR },
    { name: t('attendanceAbsent'), value: absent, color: DESTRUCTIVE_COLOR },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      <div className="relative h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
          <span className="text-3xl font-bold text-foreground">{percentage}%</span>
          <span className="text-xs text-muted-foreground">
            {t('charts.attendanceOverview')}
          </span>
        </div>
      </div>
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green" />
          <span>
            {t('attendancePresent')}: {present}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gold" />
          <span>
            {t('attendanceLate')}: {late}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-destructive" />
          <span>
            {t('attendanceAbsent')}: {absent}
          </span>
        </div>
      </div>
    </div>
  )
}

export function CourseAnalyticsChart({ data }: { data: CourseAnalytics[] }) {
  const t = useTranslations('admin.reports')
  if (data.length === 0)
    return <p className="text-center text-muted-foreground py-8">{t('noCourses')}</p>
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data.map((c) => ({ ...c, name: c.courseTitle }))}
          margin={{ top: 8, right: 8, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: TICK_COLOR }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fontSize: 12, fill: TICK_COLOR }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Bar dataKey="totalEnrollments" name={t('stats.totalEnrollments')} fill={BRAND_COLOR} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PerformanceChart({ data }: { data: StudentPerformance[] }) {
  const t = useTranslations('admin.reports')
  if (data.length === 0)
    return <p className="text-center text-muted-foreground py-8">{t('noData')}</p>
  const sorted = [...data]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10)
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={sorted.map((d) => ({ ...d, name: d.studentName }))}
          margin={{ top: 8, right: 8, left: -16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: TICK_COLOR }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fontSize: 12, fill: TICK_COLOR }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`${value}%`, t('averageScore')]} />
          <Bar dataKey="averageScore" name={t('averageScore')} fill={BRAND_COLOR} radius={[6, 6, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}