"""Extract MLA name/party/constituency/district rows from a state's MLA
list PDF. Config-driven: pass --state=<code> and the PDF path, state name,
and output location all come from config/states.json - never hardcoded.

Standalone usage:
    python3 scripts/parse_pdf.py --state=up

As a library (used by extract_state_mlas.py):
    from parse_pdf import parse_state_pdf
    leaders = parse_state_pdf(state_config)
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib.states import get_state, state_arg_parser  # noqa: E402

# Matches "<serial>. <name>\n<party>\n<constituency number-name>\n<district>"
# blocks as they appear in typical state assembly member-list PDFs.
ROW_PATTERN = re.compile(
    r'(\d+)\.\s*'
    r'([\s\S]*?)\n'
    r'([\s\S]*?)\n'
    r'(\d+[-–][^\n]+)\n'
    r'([^\n]+)'
)


def parse_state_pdf(state):
    """Returns a list of raw leader dicts for the given state config, or an
    empty list (with a warning) if the source PDF hasn't been supplied yet."""
    pdf_path = state["pdf"]
    if not os.path.exists(pdf_path):
        print(f"  [{state['code']}] PDF not found at {pdf_path}, skipping parse.")
        return []

    import fitz  # PyMuPDF - imported lazily so --help/config errors don't need it installed

    doc = fitz.open(pdf_path)
    leaders = []

    for page in doc:
        text = page.get_text()
        for match in ROW_PATTERN.findall(text):
            serial, name, party, constituency, district = match
            leaders.append({
                "serial": int(serial),
                "name": name.strip(),
                "designation": "MLA",
                "state": state["name"],
                "party": party.strip(),
                "constituency": constituency.strip(),
                "district": district.strip()
            })

    print(f"  [{state['code']}] Parsed {len(leaders)} MLA(s) from {pdf_path}")
    return leaders


def write_parsed_json(state, leaders, out_dir="output/json"):
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{state['code']}_mlas.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(leaders, f, indent=2, ensure_ascii=False)
    return out_path


if __name__ == "__main__":
    args = state_arg_parser("Parse a state's MLA list PDF into structured JSON.").parse_args()
    state = get_state(args.state, args.config)
    leaders = parse_state_pdf(state)
    out_path = write_parsed_json(state, leaders)
    print(f"Wrote {len(leaders)} record(s) to {out_path}")
