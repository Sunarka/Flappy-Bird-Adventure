"""
Script untuk crop ava.jpg menjadi 8 avatar individu.
Layout: 4 kolom x 2 baris, latar hitam.
Urutan: Luffy | Naruto | Tanjiro | Nezuko (baris 1)
         Gojo  | Goku   | Levi   | Anya   (baris 2)
"""
from PIL import Image
import os

# Path file ava
INPUT_PATH = r"C:\Users\User\.gemini\antigravity\brain\21b4b7a1-ed13-4c20-a399-76d04bdad6c7\.user_uploaded\media_1788491446253.jpg"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

avatars = [
    # baris 1
    ("luffy_mugiwara",  0, 0),
    ("naruto_sage",     1, 0),
    ("tanjiro_slayer",  2, 0),
    ("nezuko_chan",     3, 0),
    # baris 2
    ("gojo_satoru",     0, 1),
    ("goku_saiyan",     1, 1),
    ("levi_scout",      2, 1),
    ("anya_forger",     3, 1),
]

img = Image.open(INPUT_PATH)
W, H = img.size
print(f"Image size: {W}x{H}")

# Gambar punya border hitam di tepi — deteksi area aktif
# Estimasi: 4 avatar horizontal, 2 vertikal, dengan gap hitam
# Ukuran setiap avatar circle ~250px diameter, gap ~20-30px
# Baris 1 mulai dari y~20, baris 2 mulai dari y~310

COLS = 4
ROWS = 2

# Hitung ukuran per cell
cell_w = W // COLS
cell_h = H // ROWS

# Padding dalam cell untuk crop lingkaran saja (tidak ambil latar hitam)
# Lingkaran di tengah tiap cell, tambahkan sedikit margin
PAD = 10  # margin dalam pixel

print(f"Cell size: {cell_w}x{cell_h}")

for name, col, row in avatars:
    x1 = col * cell_w + PAD
    y1 = row * cell_h + PAD
    x2 = (col + 1) * cell_w - PAD
    y2 = (row + 1) * cell_h - PAD
    
    cropped = img.crop((x1, y1, x2, y2))
    
    # Resize ke 200x200 px (square)
    TARGET = 200
    cropped = cropped.resize((TARGET, TARGET), Image.LANCZOS)
    
    out_path = os.path.join(OUTPUT_DIR, f"{name}.png")
    cropped.save(out_path, "PNG", optimize=True)
    print(f"✅ Saved: {out_path}")

print("\n✅ Semua avatar berhasil di-crop!")
print("File tersimpan di:", OUTPUT_DIR)
