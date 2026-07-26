import json
import os
import shutil
import re
from pathlib import Path

JSON_PATH = "output/json/up_mlas.json"
IMAGE_DIR = "output/images"
NEW_DIR = "output/renamed"

Path(NEW_DIR).mkdir(parents=True, exist_ok=True)

with open(JSON_PATH, encoding="utf-8") as f:
    leaders = json.load(f)

def slugify(text):

    text = text.lower()

    text = re.sub(r"shri|smt\.?|dr\.?|mr\.?|mrs\.?", "", text)

    text = re.sub(r"[^a-z0-9]+", "-", text)

    text = re.sub(r"-+", "-", text)

    return text.strip("-")

for leader in leaders:

    if leader["image"]:

        old = os.path.join(
            IMAGE_DIR,
            os.path.basename(leader["image"])
        )

        new_name = slugify(leader["name"]) + ".png"

        new = os.path.join(
            NEW_DIR,
            new_name
        )

        if os.path.exists(old):

            shutil.copy(old, new)

            leader["image"] = f"leaders/up/{new_name}"

with open(JSON_PATH, "w", encoding="utf-8") as f:

    json.dump(
        leaders,
        f,
        indent=2,
        ensure_ascii=False
    )

print("Finished")