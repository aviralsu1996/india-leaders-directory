"""Extract embedded photos from a state's MLA list PDF into
output/images/<code>/, in PDF page order (match_images.py relies on that
order to pair each image back to the leader row it appeared next to).

Standalone usage:
    python3 scripts/extract_images.py --state=up
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib.states import get_state, state_arg_parser  # noqa: E402


def extract_state_images(state, base_out_dir="output/images"):
    """Returns the sorted list of extracted image paths for this state, or
    [] (with a warning) if the source PDF hasn't been supplied yet."""
    pdf_path = state["pdf"]
    if not os.path.exists(pdf_path):
        print(f"  [{state['code']}] PDF not found at {pdf_path}, skipping image extraction.")
        return []

    import fitz  # PyMuPDF

    out_dir = os.path.join(base_out_dir, state["code"])
    os.makedirs(out_dir, exist_ok=True)

    pdf = fitz.open(pdf_path)
    saved = []

    for page_index in range(len(pdf)):
        page = pdf[page_index]
        for image_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            pix = fitz.Pixmap(pdf, xref)
            if pix.n >= 5:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            out_path = os.path.join(out_dir, f"page_{page_index + 1}_{image_index + 1}.png")
            pix.save(out_path)
            saved.append(out_path)

    print(f"  [{state['code']}] Extracted {len(saved)} image(s) to {out_dir}")
    return saved


if __name__ == "__main__":
    args = state_arg_parser("Extract embedded photos from a state's MLA list PDF.").parse_args()
    state = get_state(args.state, args.config)
    saved = extract_state_images(state)
    print(f"Images Extracted: {len(saved)}")
