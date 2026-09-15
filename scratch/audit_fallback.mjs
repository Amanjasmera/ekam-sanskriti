import fs from 'fs'
import path from 'path'

const filePath = './data/map-fallback.json'
const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
console.log(`\n========================================`)
console.log(`AUDITING map-fallback.json (${content.length} items)`)
console.log(`========================================`)

const ids = new Set()
const images = new Set()
let hasErrors = false

content.forEach((item, idx) => {
  if (ids.has(item.id)) {
    console.log(`❌ Duplicate ID: ${item.id}`)
    hasErrors = true
  } else ids.add(item.id)

  if (images.has(item.image)) {
    console.log(`❌ Duplicate image: ${item.image}`)
    hasErrors = true
  } else images.add(item.image)

  console.log(`  ✓ [${item.id}] → "${item.title}" (${item.category}), Wiki EN: "${item.wikipedia_titles.en}"`)
})

if (!hasErrors) {
  console.log(`✅ map-fallback.json: 100% Unique & Valid!`)
}
