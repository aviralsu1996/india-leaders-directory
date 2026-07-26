import fitz
import os

pdf = fitz.open("data/up_mla_list.pdf")

os.makedirs("output/images", exist_ok=True)

count = 0

for page_index in range(len(pdf)):

    page = pdf[page_index]

    images = page.get_images(full=True)

    for image_index, img in enumerate(images):

        xref = img[0]

        pix = fitz.Pixmap(pdf, xref)

        if pix.n < 5:
            pix.save(f"output/images/page_{page_index+1}_{image_index+1}.png")
        else:
            pix = fitz.Pixmap(fitz.csRGB, pix)
            pix.save(f"output/images/page_{page_index+1}_{image_index+1}.png")

        count += 1

print("Images Extracted:", count)