import fitz

pdf_path = "data/up_mla_list.pdf"

doc = fitz.open(pdf_path)

print("Total Pages:", len(doc))
print("=" * 80)

for page_num, page in enumerate(doc):
    print(f"\nPAGE {page_num + 1}")
    print("=" * 80)

    text = page.get_text()
    print(text[:4000])

    if page_num >= 2:
        break