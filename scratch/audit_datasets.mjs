import fs from 'fs'
import path from 'path'

const dataDir = './data'

const files = ['monuments.json', 'foods.json', 'festivals.json', 'arts.json']

files.forEach(fileName => {
  const filePath = path.join(dataDir, fileName)
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File missing: ${fileName}`)
    return
  }
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  console.log(`\n========================================`)
  console.log(`AUDITING ${fileName} (${content.length} items)`)
  console.log(`========================================`)

  const slugs = new Set()
  const images = new Set()
  const wikiEnTitles = new Set()

  let hasErrors = false

  content.forEach((item, idx) => {
    const slug = item.slug || item.id
    const image = item.image || item.imageUrl
    const wikiEn = item.wikipedia_titles?.en || item.wikipediaTitle || item.wikipedia_title

    // Check Slug
    if (!slug) {
      console.log(`❌ Item #${idx} missing slug!`)
      hasErrors = true
    } else if (slugs.has(slug)) {
      console.log(`❌ Duplicate slug found: "${slug}"`)
      hasErrors = true
    } else {
      slugs.add(slug)
    }

    // Check Image
    if (!image) {
      console.log(`❌ Item "${slug}" missing image URL!`)
      hasErrors = true
    } else if (images.has(image)) {
      console.log(`❌ Duplicate image found for "${slug}": ${image}`)
      hasErrors = true
    } else {
      images.add(image)
    }

    // Check Wiki EN Title
    if (!wikiEn) {
      console.log(`⚠️ Item "${slug}" missing English wikipedia title!`)
    } else if (wikiEnTitles.has(wikiEn)) {
      console.log(`❌ Duplicate English wikipedia title found for "${slug}": "${wikiEn}"`)
      hasErrors = true
    } else {
      wikiEnTitles.add(wikiEn)
    }

    console.log(`  ✓ [${slug}] → Title: "${item.name || item.title}", Wiki EN: "${wikiEn}", Image: ${image ? 'VALID' : 'MISSING'}`)
  })

  if (!hasErrors) {
    console.log(`✅ ${fileName}: 100% Unique & Valid!`)
  }
})
