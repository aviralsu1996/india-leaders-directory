"""Renames matched images from their extraction filename to the leader's
slug, and rewrites the `image` field to the final DB-ready path
(/storage/leaders/<code>/<slug>.png) that scripts/import-leaders.ts
expects. Slug logic mirrors scripts/lib states.ts's baseSlugFromName so a
leader's slug and its image filename always agree.

Standalone usage (operates on output/json/<code>_mlas.json in place):
    python3 scripts/rename_images.py --state=up
"""
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib.states import get_state, state_arg_parser  # noqa: E402

# Only strips a *leading* honorific (matches scripts/import-leaders.ts).
# A naive "remove these words anywhere" regex would also mangle names that
# merely contain the same letters, e.g. "dr" inside "Chandra".
HONORIFIC_PREFIX = re.compile(r"^(shri|smt\.?|dr\.?|mr\.?|mrs\.?|km\.?)\s+", re.IGNORECASE)


def slugify(name):
    name = HONORIFIC_PREFIX.sub("", name.strip())
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def rename_images(state, leaders, image_dir, out_dir):
    """Copies each leader's matched image to <out_dir>/<slug>.png and
    rewrites `image` to the final /storage/leaders/<code>/<slug>.png path.
    Returns a new leader list; leaders with no matched or missing source
    image are left with image=None rather than failing the batch."""
    os.makedirs(out_dir, exist_ok=True)
    renamed = []

    for leader in leaders:
        entry = dict(leader)
        source = entry.get("image")

        if source and os.path.exists(source):
            new_name = f"{slugify(entry['name'])}.png"
            destination = os.path.join(out_dir, new_name)
            shutil.copy(source, destination)
            entry["image"] = f"/storage/leaders/{state['code']}/{new_name}"
        else:
            entry["image"] = None

        renamed.append(entry)

    return renamed


if __name__ == "__main__":
    args = state_arg_parser("Rename matched images to each leader's slug.").parse_args()
    state = get_state(args.state, args.config)

    json_path = os.path.join("output", "json", f"{state['code']}_mlas.json")
    image_dir = os.path.join("output", "images", state["code"])
    out_dir = os.path.join("output", "renamed", state["code"])

    with open(json_path, encoding="utf-8") as f:
        leaders = json.load(f)

    renamed = rename_images(state, leaders, image_dir, out_dir)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(renamed, f, indent=2, ensure_ascii=False)

    matched_count = sum(1 for leader in renamed if leader.get("image"))
    print(f"  [{state['code']}] Renamed {matched_count}/{len(renamed)} image(s) into {out_dir}")
