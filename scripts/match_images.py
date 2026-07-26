import json
import os

JSON_PATH = "output/json/up_mlas.json"
IMAGE_DIR = "output/images"

with open(JSON_PATH, "r", encoding="utf-8") as f:
    leaders = json.load(f)

images = sorted(os.listdir(IMAGE_DIR))

print("Leaders :", len(leaders))
print("Images  :", len(images))

for i, leader in enumerate(leaders):

    if i < len(images):

        leader["image"] = f"leaders/up/{images[i]}"

    else:

        leader["image"] = None

with open(JSON_PATH, "w", encoding="utf-8") as f:

    json.dump(leaders, f, indent=2, ensure_ascii=False)

print("Done!")