'use client'

import React from 'react'

// Base pulsing block
export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm)',
  style = {}
}: {
  width?: string
  height?: string
  borderRadius?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--border-default)',
        opacity: 0.7,
        ...style
      }}
    />
  )
}

// Composite skeleton: Dashboard page
export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 3 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Skeleton width="48px" height="48px" borderRadius="50%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="40%" height="12px" />
              <Skeleton width="70%" height="24px" />
              <Skeleton width="50%" height="10px" />
            </div>
          </div>
        ))}
      </div>

      {/* Main panels layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', flexWrap: 'wrap' }}>
        {/* Left Tasks panel */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="150px" height="20px" />
            <Skeleton width="80px" height="30px" />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <Skeleton width="20px" height="20px" borderRadius="4px" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Skeleton width="60%" height="14px" />
                <Skeleton width="30%" height="10px" />
              </div>
              <Skeleton width="60px" height="20px" borderRadius="10px" />
            </div>
          ))}
        </div>

        {/* Right Finance panel */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="120px" height="20px" />
            <Skeleton width="80px" height="30px" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <Skeleton width="36px" height="36px" borderRadius="50%" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Skeleton width="50%" height="14px" />
                <Skeleton width="80%" height="10px" />
              </div>
              <Skeleton width="70px" height="16px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Composite skeleton: Tasks List page
export function TasksSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <Skeleton width="80%" height="28px" />
          <Skeleton width="60%" height="12px" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton width="80px" height="36px" />
          <Skeleton width="110px" height="36px" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Skeleton width="180px" height="36px" />
        <Skeleton width="70px" height="28px" borderRadius="14px" />
        <Skeleton width="90px" height="28px" borderRadius="14px" />
        <Skeleton width="80px" height="28px" borderRadius="14px" />
      </div>

      {/* Task List items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Skeleton width="8px" height="8px" borderRadius="50%" />
            <Skeleton width="20px" height="20px" borderRadius="4px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="45%" height="14px" />
              <Skeleton width="25%" height="10px" />
            </div>
            <Skeleton width="80px" height="22px" borderRadius="11px" />
            <Skeleton width="70px" height="22px" borderRadius="11px" />
            <Skeleton width="30px" height="30px" borderRadius="50%" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Composite skeleton: Kanban Task Board page
export function TaskBoardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <Skeleton width="80%" height="28px" />
          <Skeleton width="60%" height="12px" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton width="100px" height="36px" />
          <Skeleton width="110px" height="36px" />
        </div>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              minWidth: '280px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Skeleton width="100px" height="18px" />
              <Skeleton width="24px" height="18px" borderRadius="9px" />
            </div>

            {/* Cards inside column */}
            {[1, 2].map(j => (
              <div key={j} className="card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Skeleton width="18px" height="18px" borderRadius="4px" />
                  <Skeleton width="80%" height="14px" />
                </div>
                <Skeleton width="95%" height="10px" />
                <Skeleton width="60%" height="10px" />
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  <Skeleton width="45px" height="16px" borderRadius="8px" />
                  <Skeleton width="55px" height="16px" borderRadius="8px" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <Skeleton width="70px" height="16px" borderRadius="8px" />
                  <Skeleton width="40px" height="16px" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Composite skeleton: Finance Entries page
export function FinanceSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <Skeleton width="80%" height="28px" />
          <Skeleton width="60%" height="12px" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton width="90px" height="36px" />
          <Skeleton width="120px" height="36px" />
        </div>
      </div>

      {/* Summary Banner */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="80px" height="10px" />
              <Skeleton width="110px" height="20px" />
            </div>
          ))}
        </div>
        <Skeleton width="90px" height="32px" />
      </div>

      {/* Filter Bar */}
      <div className="filter-bar" style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Skeleton width="180px" height="36px" />
        <Skeleton width="80px" height="28px" borderRadius="14px" />
        <Skeleton width="80px" height="28px" borderRadius="14px" />
      </div>

      {/* Transaction List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Skeleton width="32px" height="32px" borderRadius="50%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="40%" height="14px" />
              <Skeleton width="20%" height="10px" />
            </div>
            <Skeleton width="100px" height="20px" borderRadius="10px" />
            <Skeleton width="80px" height="16px" />
            <div style={{ display: 'flex', gap: '4px' }}>
              <Skeleton width="28px" height="28px" borderRadius="4px" />
              <Skeleton width="28px" height="28px" borderRadius="4px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composite skeleton: Finance Summary Charts page
export function FinanceSummarySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '300px' }}>
          <Skeleton width="70%" height="28px" />
          <Skeleton width="90%" height="12px" />
        </div>
        <Skeleton width="140px" height="36px" />
      </div>

      {/* Time filters */}
      <div className="card" style={{ padding: '16px', display: 'flex', gap: '8px' }}>
        <Skeleton width="100px" height="28px" borderRadius="14px" />
        <Skeleton width="100px" height="28px" borderRadius="14px" />
        <Skeleton width="100px" height="28px" borderRadius="14px" />
      </div>

      {/* 3 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Skeleton width="48px" height="48px" borderRadius="50%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="40%" height="10px" />
              <Skeleton width="70%" height="24px" />
              <Skeleton width="50%" height="10px" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: '20px', minHeight: '340px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Skeleton width="180px" height="20px" />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 2 ? (
                // Circular layout for Donut Pie
                <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '50%', border: '24px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Skeleton width="60px" height="12px" />
                </div>
              ) : (
                // Grid/Bar outline
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px' }}>
                  {[40, 70, 50, 90, 60, 80, 45].map((h, k) => (
                    <Skeleton key={k} width="100%" height={`${h}%`} borderRadius="4px 4px 0 0" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composite skeleton: Budget Goals page
export function BudgetSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
        <Skeleton width="80%" height="28px" />
        <Skeleton width="60%" height="12px" />
      </div>

      {/* Main Budget Progress Card */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="120px" height="12px" />
            <Skeleton width="220px" height="36px" />
          </div>
          <Skeleton width="100px" height="32px" />
        </div>
        {/* Progress bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="100%" height="16px" borderRadius="8px" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="80px" height="10px" />
            <Skeleton width="100px" height="10px" />
          </div>
        </div>
      </div>

      {/* History & Table panel */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton width="150px" height="20px" />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '150px' }}>
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="10px" />
            </div>
            <Skeleton width="100px" height="18px" />
            <Skeleton width="80px" height="18px" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Composite skeleton: Settings page
export function SettingsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
        <Skeleton width="80%" height="28px" />
        <Skeleton width="60%" height="12px" />
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Skeleton width="24px" height="24px" borderRadius="4px" />
              <Skeleton width="120px" height="18px" />
            </div>
            <div style={{ width: '100%', height: '1px', background: 'var(--border-subtle)' }} />
            
            {[1, 2].map(j => (
              <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton width="80px" height="12px" />
                <Skeleton width="100%" height="38px" borderRadius="var(--radius-md)" />
              </div>
            ))}
            <Skeleton width="120px" height="38px" style={{ marginTop: '8px', alignSelf: 'flex-start' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Composite skeleton: Admin panel lists / User table page
export function AdminSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '250px' }}>
          <Skeleton width="70%" height="28px" />
          <Skeleton width="90%" height="12px" />
        </div>
        <Skeleton width="120px" height="36px" />
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="200px" height="36px" />
          <Skeleton width="80px" height="36px" />
        </div>
        
        {/* Table rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '16px', padding: '12px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <Skeleton width="80%" height="14px" />
              <Skeleton width="70%" height="14px" />
              <Skeleton width="50%" height="14px" />
              <Skeleton width="40%" height="14px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
