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
const notify = flags.has('--notify')
const auto = flags.has('--auto')
const sound = flags.has('--sound')
const openCreated = flags.has('--open-created') || flags.has('--open')

let pending = false
let queued = false
let watcher
let animTimer = null
let animIdx = 0

const ORANGE = '\x1b[38;5;208m'
const RESET = '\x1b[0m'
const frames = ['◐', '◓', '◑', '◒']

function startAnimation() {
  if (animTimer || !process.stdout.isTTY) return
  // Initial draw: newline, spinner line, newline, then move cursor back up one line
  const first = frames[animIdx++ % frames.length]
  const initialLine = `${ORANGE}>>>> WAITING FOR MEME IMAGES >>>> ${first}${RESET}`
  process.stdout.write('\n')
  process.stdout.write(initialLine + '\n')
  process.stdout.write('\x1b[1A')
  animTimer = setInterval(() => {
    const f = frames[animIdx++ % frames.length]
    const line = `${ORANGE}>>>> WAITING FOR MEME IMAGES >>>> ${f}${RESET}`
    process.stdout.write('\r' + line + '\x1b[0K')
  }, 120)
}

function stopAnimation(insertNewline = false) {
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
  if (process.stdout.isTTY) {
    process.stdout.write('\r\x1b[0K')
    if (insertNewline) process.stdout.write('\n')
  }
}

function runCheck() {
  if (pending) {
    queued = true
    return
  }
  stopAnimation(true)
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
      // List new image paths
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
        if (!auto) startAnimation()
      })

      if (sound && process.platform === 'darwin') {
        spawn('osascript', ['-e', 'beep 1'], {
          detached: true,
          stdio: 'ignore',
        }).unref()
      }
      if (auto) {
        console.log(
          '[watch-new-memes] Auto-mode enabled → running: pnpm process-images'
        )
        const procArgs = ['process-images', '--reload-browser']
        if (openCreated) procArgs.push('--open-created')
        const proc = spawn('pnpm', procArgs, {
          cwd: rootDir,
          stdio: 'inherit',
        })
        proc.on('exit', (c) => {
          if (c !== 0) {
            console.error(
              '[watch-new-memes] process-images exited with code',
              c
            )
          }
          startAnimation()
        })
      }
    } else {
      // No new images → resume animation
      startAnimation()
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

// Initial check and animation
runCheck()
startRecursiveWatch(memesDir)
startAnimation()

process.on('SIGINT', () => {
  console.log('\n[watch-new-memes] Stopping')
  if (watcher) watcher.close()
  stopAnimation(false)
  process.exit(0)
})
