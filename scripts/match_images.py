"""Pairs each extracted image with the leader row it appeared next to in
the source PDF, by position (image N -> leader N). This is a positional
heuristic, not content matching - it depends on parse_pdf.py and
extract_images.py having walked the same PDF in the same page order.

Standalone usage (operates on output/json/<code>_mlas.json in place):
    python3 scripts/match_images.py --state=up
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib.states import get_state, state_arg_parser  # noqa: E402


def match_images(leaders, image_paths):
    """Returns a new list of leader dicts with an `image` key set to the
    matching extracted file's path, or None past the end of the image list."""
    matched = []
    for i, leader in enumerate(leaders):
        entry = dict(leader)
        entry["image"] = image_paths[i] if i < len(image_paths) else None
        matched.append(entry)
    return matched


if __name__ == "__main__":
    args = state_arg_parser("Match extracted images to parsed MLA rows by position.").parse_args()
    state = get_state(args.state, args.config)

    json_path = os.path.join("output", "json", f"{state['code']}_mlas.json")
    image_dir = os.path.join("output", "images", state["code"])

    with open(json_path, "r", encoding="utf-8") as f:
        leaders = json.load(f)

    image_paths = [os.path.join(image_dir, name) for name in sorted(os.listdir(image_dir))] if os.path.isdir(image_dir) else []
    matched = match_images(leaders, image_paths)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(matched, f, indent=2, ensure_ascii=False)

    matched_count = sum(1 for leader in matched if leader.get("image"))
    print(f"  [{state['code']}] Matched {matched_count}/{len(matched)} leader(s) to an image")
