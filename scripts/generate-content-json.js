// scripts/generate-content-json.js
import fs from "fs"
import path from "path"
import fetch from "node-fetch"

const types = ["claims", "quotes", "memes"]

for (const type of types) {
  const res = await fetch(`http://localhost:3000/api/content?type=${type}`)
  const data = await res.json()
  fs.writeFileSync(`public/content-${type}.json`, JSON.stringify(data, null, 2))
}
