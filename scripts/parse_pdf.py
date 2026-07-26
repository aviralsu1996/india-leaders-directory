import fitz
import json
import re
from pathlib import Path

PDF_PATH = "data/up_mla_list.pdf"

doc = fitz.open(PDF_PATH)

leaders = []

pattern = re.compile(
    r'(\d+)\.\s*'
    r'([\s\S]*?)\n'
    r'([\s\S]*?)\n'
    r'(\d+[-–][^\n]+)\n'
    r'([^\n]+)'
)

for page in doc:
    text = page.get_text()

    matches = pattern.findall(text)

    for m in matches:

        number = m[0]

        name = m[1].strip()

        party = m[2].strip()

        constituency = m[3].strip()

        district = m[4].strip()

        leaders.append({

            "serial": int(number),

            "name": name,

            "designation": "MLA",

            "state": "Uttar Pradesh",

            "party": party,

            "constituency": constituency,

            "district": district

        })

Path("output/json").mkdir(parents=True, exist_ok=True)

with open("output/json/up_mlas.json","w",encoding="utf-8") as f:
    json.dump(leaders,f,indent=2,ensure_ascii=False)

print("Done!")
print("Total MLAs:",len(leaders))
print("Saved to output/json/up_mlas.json")