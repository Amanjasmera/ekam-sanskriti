import re
import os

i18n_path = r'd:\HAC\ekam-sanskriti\lib\i18n.ts'

with open(i18n_path, 'r', encoding='utf-8') as f:
    content = f.read()

unified_india_prop = """
  unifiedIndia: {
    scriptures: "Ancient Scriptures",
    readMore: "Read More",
    keyTeachings: "Key Teachings",
    period: "Period",
    language: "Language",
    listenToSummary: "Listen to Summary",
    readFullOnWikipedia: "Read Full on Wikipedia",
  },
"""

# Let's split by 'export const '
parts = content.split('export const ')

new_parts = [parts[0]]

for part in parts[1:]:
    # This is a language definition, e.g. "hi = { ..."
    if 'landingPage: {' in part and 'unifiedIndia: {' not in part:
        # insert unifiedIndia just before the first landingPage: {
        part = part.replace('landingPage: {', unified_india_prop.lstrip('\n') + '  landingPage: {', 1)
    new_parts.append(part)

new_content = 'export const '.join(new_parts)

with open(i18n_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done")
