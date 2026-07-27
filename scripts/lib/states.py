"""Shared config loader for the MLA extraction pipeline.

Every script (parse_pdf.py, extract_images.py, match_images.py,
rename_images.py, extract_state_mlas.py) reads state metadata through
this module instead of hardcoding a state name, PDF path, or output
folder. Adding a new state means adding one entry to config/states.json -
never adding a branch to any script.
"""
import argparse
import json
import os

DEFAULT_CONFIG_PATH = "config/states.json"


class UnknownStateError(Exception):
    pass


def load_states(config_path=DEFAULT_CONFIG_PATH):
    with open(config_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    if not isinstance(raw, list):
        raise ValueError(f"{config_path} must contain a JSON array of state entries.")

    seen_codes = set()
    states = []
    for entry in raw:
        if not entry.get("name") or not entry.get("code") or not entry.get("pdf"):
            raise ValueError(f"Invalid entry in {config_path}: each state needs a name, code, and pdf path.")
        if entry["code"] in seen_codes:
            raise ValueError(f"Duplicate state code '{entry['code']}' in {config_path}.")
        seen_codes.add(entry["code"])

        state = dict(entry)
        state["data_file"] = os.path.join("data", "import", f"{entry['code']}_mlas.json")
        state["image_dir"] = os.path.join("storage", "leaders", entry["code"])
        states.append(state)

    return states


def get_state(code, config_path=DEFAULT_CONFIG_PATH):
    states = load_states(config_path)
    for state in states:
        if state["code"] == code:
            return state
    known = ", ".join(s["code"] for s in states)
    raise UnknownStateError(f"Unknown state code '{code}'. Configured codes: {known}")


def state_arg_parser(description):
    """Standard --state=<code> / --config=<path> CLI for every pipeline script."""
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--state", required=True, help="State code from config/states.json (e.g. up, br, ka)")
    parser.add_argument("--config", default=DEFAULT_CONFIG_PATH, help="Path to states config (default: config/states.json)")
    return parser
