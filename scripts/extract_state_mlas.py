"""Single entry point for turning one state's MLA list PDF into an
import-ready data/import/<code>_mlas.json plus published images under
public/storage/leaders/<code>/.

Runs the same four stages as the standalone scripts (parse -> extract
images -> match -> rename), for whichever state(s) you point it at. There
is no per-state script: add a state by adding it to config/states.json and
dropping its PDF at the configured path.

Usage:
    python3 scripts/extract_state_mlas.py --state=up
    python3 scripts/extract_state_mlas.py --all
"""
import argparse
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib.states import load_states, get_state, DEFAULT_CONFIG_PATH  # noqa: E402
from parse_pdf import parse_state_pdf  # noqa: E402
from extract_images import extract_state_images  # noqa: E402
from match_images import match_images  # noqa: E402
from rename_images import rename_images  # noqa: E402


def process_state(state):
    """Runs the full pipeline for one state. Returns a summary dict; a
    state with no PDF yet is reported, not treated as an error, so --all
    can be re-run as PDFs are added over time."""
    print(f"Processing {state['name']} ({state['code']})...")

    if not os.path.exists(state["pdf"]):
        print(f"  [{state['code']}] No PDF at {state['pdf']} yet - skipping.")
        return {"code": state["code"], "name": state["name"], "status": "skipped", "leaders": 0, "images": 0}

    leaders = parse_state_pdf(state)
    if not leaders:
        print(f"  [{state['code']}] PDF parsed but no MLA rows were recognized - skipping.")
        return {"code": state["code"], "name": state["name"], "status": "empty", "leaders": 0, "images": 0}

    image_paths = extract_state_images(state)
    matched = match_images(leaders, image_paths)

    image_dir = os.path.join("output", "images", state["code"])
    renamed_dir = os.path.join("output", "renamed", state["code"])
    final_leaders = rename_images(state, matched, image_dir, renamed_dir)

    os.makedirs("data/import", exist_ok=True)
    data_file = state["data_file"]
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(final_leaders, f, indent=2, ensure_ascii=False)

    publish_dir = os.path.join("public", "storage", "leaders", state["code"])
    os.makedirs(publish_dir, exist_ok=True)
    published = 0
    if os.path.isdir(renamed_dir):
        for filename in os.listdir(renamed_dir):
            shutil.copy(os.path.join(renamed_dir, filename), os.path.join(publish_dir, filename))
            published += 1

    print(f"  [{state['code']}] Wrote {len(final_leaders)} leader(s) to {data_file}, published {published} image(s) to {publish_dir}")
    return {"code": state["code"], "name": state["name"], "status": "ok", "leaders": len(final_leaders), "images": published}


def main():
    parser = argparse.ArgumentParser(description="Extract one or all states' MLA list PDFs into import-ready JSON.")
    parser.add_argument("--state", help="State code from config/states.json (e.g. up, br, ka)")
    parser.add_argument("--all", action="store_true", help="Process every configured state")
    parser.add_argument("--config", default=DEFAULT_CONFIG_PATH, help="Path to states config (default: config/states.json)")
    args = parser.parse_args()

    if not args.state and not args.all:
        parser.error("Pass --state=<code> or --all")

    states = [get_state(args.state, args.config)] if args.state else load_states(args.config)

    results = [process_state(state) for state in states]

    print("\nSummary:")
    for r in results:
        print(f"  {r['code']:>3}  {r['status']:<8}  leaders={r['leaders']:<4}  images={r['images']}")


if __name__ == "__main__":
    main()
