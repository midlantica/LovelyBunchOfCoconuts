#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const memesDir = path.join(rootDir, 'public', 'memes')

const rawArgs = process.argv.slice(2)
const flags = new Set(rawArgs.filter((a) => a.startsWith('--')))
const notify = flags.has('--notify') // pass through to check script
const auto = flags.has('--auto') // automatically run process-images if new files
const sound = flags.has('--sound') // play a ding when new images are detected (macOS)

let pending = false
let queued = false
let watcher

function runCheck() {
  if (pending) {
    queued = true
    return
  }
  pending = true
  const args = ['scripts/check-new-memes.js', '--quiet']
  if (notify) args.push('--notify')
  const p = spawn('node', args, { cwd: rootDir, stdio: 'ignore' })
  p.on('exit', (code) => {
    const hasNew = code === 2
    if (hasNew) {
      console.log(
        '[watch-new-memes] New images detected. Run: pnpm process-images'
      )
      // Print list of new image paths (relative to public/memes)
      try {
        const list = spawn(
          'node',
          ['scripts/check-new-memes.js', '--list-new', '--no-fail'],
          { cwd: rootDir }
        )
        let buf = ''
        list.stdout.on('data', (d) => (buf += d.toString()))
        list.on('close', () => {
          const lines = buf
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean)
          if (lines.length) {
            console.log('New Meme images :')
            lines.forEach((ln) => console.log(ln))
          }
        })
      } catch {}
      if (sound && process.platform === 'darwin') {
        // Non-blocking; ignore errors
        spawn('osascript', ['-e', 'beep 1'], {
          detached: true,
          stdio: 'ignore',
        }).unref()
      }
      if (auto) {
        console.log(
          '[watch-new-memes] Auto-mode enabled → running: pnpm process-images'
        )
        const proc = spawn('pnpm', ['process-images', '--reload-browser'], {
          cwd: rootDir,
          stdio: 'inherit',
        })
        proc.on('exit', (c) => {
          if (c !== 0)
            console.error(
              '[watch-new-memes] process-images exited with code',
              c
            )
        })
      }
    }
    pending = false
    if (queued) {
      queued = false
      runCheck()
    }
  })
}

function startRecursiveWatch(dir) {
  console.log('[watch-new-memes] Watching', dir)
  try {
    watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return
      // Only react to imagey names
      if (!/\.(png|jpe?g|gif|webp)$/i.test(filename)) return
      // Debounce bursts
      if (!queued && !pending) {
        queued = true
        setTimeout(() => {
          queued = false
          runCheck()
        }, 500)
      } else {
        queued = true
      }
    })
  } catch (err) {
    console.warn(
      '[watch-new-memes] fs.watch recursive not available; falling back to polling every 10s'
    )
    setInterval(runCheck, 10_000)
    return
  }
}

// Initial check on start
runCheck()
startRecursiveWatch(memesDir)

process.on('SIGINT', () => {
  console.log('\n[watch-new-memes] Stopping')
  if (watcher) watcher.close()
  process.exit(0)
})
