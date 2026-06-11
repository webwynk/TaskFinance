'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import toast from 'react-hot-toast'

interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  colorBg: string
  colorText: string
  count: number
  total: number
}

interface SummaryData {
  totalExpenses: number
  totalIncome: number
  net: number
  expenseCount: number
  incomeCount: number
  byCategory: CategoryBreakdown[]
  dailyTotals: Record<string, number>
}

interface Props {
  initialSummary: SummaryData
}

export default function FinanceSummaryClient({ initialSummary }: Props) {
  const [summary, setSummary] = useState<SummaryData>(initialSummary)
  const [period, setPeriod] = useState<'month' | 'week' | 'custom'>('month')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Hydration guard
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch summary when period or custom date range changes
  const fetchSummary = async (selectedPeriod: typeof period, from = fromDate, to = toDate) => {
    setIsLoading(true)
    try {
      let url = `/api/finance/summary?period=${selectedPeriod}`
      if (selectedPeriod === 'custom' && from && to) {
        url += `&from=${from}&to=${to}`
      }
      const res = await fetch(url)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setSummary(json.data)
    } catch {
      toast.error('Failed to load finance summary data')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod)
    if (newPeriod !== 'custom') {
      fetchSummary(newPeriod)
    }
  }

  const handleCustomRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates')
      return
    }
    fetchSummary('custom', fromDate, toDate)
  }

  // Format daily totals data for Recharts Bar Chart
  const barChartData = useMemo(() => {
    return Object.entries(summary.dailyTotals)
      .map(([dateStr, amount]) => {
        // Date formatting
        let label = dateStr
        try {
          const parts = dateStr.split('-')
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
            label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          }
        } catch {}

        return {
          date: label,
          amount
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [summary.dailyTotals])

  // Donut chart pie chart data
  const pieChartData = useMemo(() => {
    return summary.byCategory.map(c => ({
      name: c.categoryName,
      value: c.total,
      color: c.colorBg
    }))
  }, [summary.byCategory])

  // Grouped comparison data (Income vs Expenses)
  const comparisonData = useMemo(() => {
    return [
      {
        name: 'Comparison',
        Income: summary.totalIncome,
        Expenses: summary.totalExpenses
      }
    ]
  }, [summary.totalIncome, summary.totalExpenses])

  if (!isMounted) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ height: '40px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }} className="animate-pulse" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', height: '100px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }} className="animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Finance Summary</h1>
          <p className="text-caption" style={{ color: 'var(--text-tertiary)' }}>
            Visually analyze your monthly cashflow and category distributions.
          </p>
        </div>
        <div>
          <Link href="/finance" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Back to Entries
          </Link>
        </div>
      </div>

      {/* Filter and Date Range Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['month', 'week', 'custom'] as const).map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`filter-pill${period === p ? ' active' : ''}`}
            >
              {p === 'month' ? 'This Month' : p === 'week' ? 'Past 7 Days' : 'Custom Range'}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <form onSubmit={handleCustomRangeSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label className="label" htmlFor="sum-from" style={{ marginBottom: 0 }}>From</label>
              <input
                id="sum-from"
                type="date"
                className="input"
                style={{ height: '36px', width: '130px', padding: '0 10px' }}
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label className="label" htmlFor="sum-to" style={{ marginBottom: 0 }}>To</label>
              <input
                id="sum-to"
                type="date"
                className="input"
                style={{ height: '36px', width: '130px', padding: '0 10px' }}
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ height: '36px' }}>
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Income Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-mint-deep)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-mint)', color: 'var(--color-mint-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Income</p>
            <h3 className="text-h2" style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
              {formatCurrency(summary.totalIncome)}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{summary.incomeCount} transactions</p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-rose-deep)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-rose)', color: 'var(--color-rose-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Expenses</p>
            <h3 className="text-h2" style={{ color: 'var(--text-primary)', marginTop: '4px' }}>
              {formatCurrency(summary.totalExpenses)}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{summary.expenseCount} transactions</p>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: `4px solid ${summary.net >= 0 ? 'var(--color-mint-deep)' : 'var(--color-rose-deep)'}` }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: summary.net >= 0 ? 'var(--color-mint)' : 'var(--color-rose)',
            color: summary.net >= 0 ? 'var(--color-mint-deep)' : 'var(--color-rose-deep)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Cashflow</p>
            <h3 className="text-h2" style={{ color: summary.net >= 0 ? 'var(--color-mint-deep)' : 'var(--color-rose-deep)', marginTop: '4px' }}>
              {formatCurrency(summary.net)}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {summary.net >= 0 ? 'Surplus cash' : 'Overspending budget'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Daily Expenses Bar Chart */}
        <div className="card animate-scale-in" style={{ padding: '20px', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Daily Expenses</h2>
          <div style={{ flex: 1, width: '100%', minHeight: '250px' }}>
            {barChartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No expense data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: '11px' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: '11px' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '6px', fontSize: '12px' }}
                    labelStyle={{ fontWeight: 600, color: 'var(--text-primary)' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Spent']}
                  />
                  <Bar dataKey="amount" fill="var(--color-rose-deep)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Expense Pie Chart */}
        <div className="card animate-scale-in" style={{ padding: '20px', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Expenses by Category</h2>
          <div style={{ flex: 1, width: '100%', minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pieChartData.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>No categories spent in this period</div>
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '6px', fontSize: '12px' }}
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Total']}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Grouped Income vs Expense Bar Chart */}
        <div className="card animate-scale-in" style={{ padding: '20px', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Income vs Expenses</h2>
          <div style={{ flex: 1, width: '100%', minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: '11px' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                />
                <Bar dataKey="Income" fill="var(--color-mint-deep)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Expenses" fill="var(--color-rose-deep)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Category Breakdown Table */}
        <div className="card animate-scale-in" style={{ padding: '20px', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="text-h3" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Category Breakdown</h2>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {summary.byCategory.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No categories to display
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '8px', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '8px', fontWeight: 600, textAlign: 'center' }}>Transactions</th>
                      <th style={{ padding: '8px', fontWeight: 600, textAlign: 'right' }}>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.byCategory.map(c => {
                      const pct = summary.totalExpenses > 0 ? (c.total / summary.totalExpenses) * 100 : 0
                      return (
                        <tr key={c.categoryId} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                          <td style={{ padding: '10px 8px' }}>
                            <span
                              className="chip"
                              style={{
                                background: c.colorBg,
                                color: c.colorText,
                                border: `1px solid ${c.colorText}33`
                              }}
                            >
                              {c.categoryName}
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {c.count}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 500 }}>
                            <div>{formatCurrency(c.total)}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                              {pct.toFixed(1)}% of expenses
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
