import { defineConfig } from 'prisma/config'

// Load .env.local for local development
const fs = require('fs')
const path = require('path')
const envFile = path.resolve(__dirname, '.env.local')
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx !== -1) {
        const key = trimmed.slice(0, idx)
        let val = trimmed.slice(idx + 1)
        // Strip surrounding quotes
        val = val.replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    }
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Use DIRECT_URL (port 5432) for migrations/db push; falls back to DATABASE_URL
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
})
