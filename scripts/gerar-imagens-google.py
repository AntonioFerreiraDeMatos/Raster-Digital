"""Gera favicon, ícones, logo quadrada e imagens de compartilhamento da Raster Digital.

Fonte: brand/logo-original.png (logo horizontal em alta, fundo transparente).
Uso (na raiz do projeto):  python scripts/gerar-imagens-google.py

Por que existe: o Google mostra o favicon recortado em círculo e trata fundo
transparente como branco. Aqui o ícone usa só o "R" sobre fundo azul-marinho,
dentro da área que sobrevive ao recorte circular.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "brand" / "logo-original.png"
PUBLIC = ROOT / "public"
PERFIL = ROOT / "brand" / "perfil-google"

BASE = (3, 8, 20)          # #030814, mesma cor do theme-color do site
GLOW = (14, 58, 160)       # brilho azul no centro
HALO = (31, 109, 255)      # halo atrás do símbolo
WHITE = (244, 248, 255)
CYAN = (34, 200, 255)      # #22c8ff
MUTED = (159, 179, 209)
SPLIT_X = 704              # coluna vazia entre o "R" e o texto RASTER na logo original

FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"


def trim(im, threshold=8):
    box = im.getchannel("A").point(lambda v: 255 if v > threshold else 0).getbbox()
    return im.crop(box)


def background(w, h, center=(0.5, 0.45), radius=0.8, strength=0.9):
    """Fundo azul-marinho com brilho radial suave."""
    canvas = Image.new("RGB", (w, h), BASE)
    glow = Image.new("RGB", (w, h), GLOW)
    r = int(max(w, h) * radius)
    grad = Image.radial_gradient("L").resize((2 * r, 2 * r), Image.BICUBIC)
    # centro claro -> borda escura, com queda suave
    grad = grad.point(lambda v: int(max(0, 255 - v * 1.0) ** 1.6 / 255 ** 0.6 * strength))
    mask = Image.new("L", (w, h), 0)
    mask.paste(grad, (int(w * center[0]) - r, int(h * center[1]) - r))
    return Image.composite(glow, canvas, mask)


def with_halo(mark, blur_ratio=0.06, opacity=0.55):
    """Símbolo com um halo azul desfocado por trás (canvas maior para o halo não cortar)."""
    pad = int(max(mark.size) * blur_ratio * 3)
    out = Image.new("RGBA", (mark.width + 2 * pad, mark.height + 2 * pad), (0, 0, 0, 0))
    alpha = Image.new("L", out.size, 0)
    alpha.paste(mark.getchannel("A"), (pad, pad))
    alpha = alpha.filter(ImageFilter.GaussianBlur(max(mark.size) * blur_ratio))
    alpha = alpha.point(lambda v: int(v * opacity))
    halo = Image.new("RGBA", out.size, HALO + (0,))
    halo.putalpha(alpha)
    out.alpha_composite(halo)
    out.alpha_composite(mark, (pad, pad))
    return out, pad


def paste_center(canvas, im, cx, cy):
    canvas.paste(im, (round(cx - im.width / 2), round(cy - im.height / 2)), im)


def fit(im, width=None, height=None):
    if width:
        height = round(im.height * width / im.width)
    else:
        width = round(im.width * height / im.height)
    return im.resize((width, height), Image.LANCZOS)


def icon(size, logo_r, safe=0.45):
    """Ícone quadrado: "R" centralizado, cabendo no círculo de raio safe*size."""
    S = 1024
    # brilho de fundo mais fraco que nas artes grandes: em 16–32 px o "R" azul precisa de contraste
    canvas = background(S, S, center=(0.5, 0.5), radius=0.7, strength=0.55)
    solid = logo_r.getchannel("A").point(lambda v: 255 if v > 60 else 0)
    box = solid.getbbox()
    mark = logo_r.crop(box)
    # raio do ponto visível mais distante do centro do bbox
    cx, cy = mark.width / 2, mark.height / 2
    px = solid.crop(box).load()
    far = max(
        ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
        for y in range(0, mark.height, 3)
        for x in range(0, mark.width, 3)
        if px[x, y]
    )
    scale = safe * S / far
    mark = mark.resize((round(mark.width * scale), round(mark.height * scale)), Image.LANCZOS)
    mark, _ = with_halo(mark)
    paste_center(canvas, mark, S / 2, S / 2)
    out = canvas.resize((size, size), Image.LANCZOS)
    if size <= 64:
        out = ImageEnhance.Contrast(out).enhance(1.15)
        out = out.filter(ImageFilter.UnsharpMask(radius=1, percent=70, threshold=2))
    return out


def text_center(draw, y, text, font, fill, cx):
    draw.text((cx, y), text, font=font, fill=fill, anchor="ms")


def banner(w, h, logo_full, logo_width, lines, logo_cy=None):
    """Logo horizontal centralizada + frases centralizadas embaixo."""
    canvas = background(w, h, center=(0.5, 0.38), radius=0.7)
    mark, _ = with_halo(fit(logo_full, width=logo_width), blur_ratio=0.03, opacity=0.45)
    logo_h = round(logo_full.height * logo_width / logo_full.width)
    text_h = sum(size + gap for _, size, _, gap, _ in lines)
    gap_logo = round(h * 0.07)
    top = (h - (logo_h + gap_logo + text_h)) / 2 if logo_cy is None else logo_cy - logo_h / 2
    paste_center(canvas, mark, w / 2, top + logo_h / 2)
    draw = ImageDraw.Draw(canvas)
    y = top + logo_h + gap_logo
    for text, size, color, gap, bold in lines:
        y += size
        text_center(draw, y, text, ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size), color, w / 2)
        y += gap
    return canvas


def stacked(size, logo_r, wordmark, lines=()):
    """Logo quadrada: "R" em cima, RASTER DIGITAL embaixo."""
    canvas = background(size, size, center=(0.5, 0.4), radius=0.75)
    r_h = round(size * (0.40 if lines else 0.44))
    w_w = round(size * 0.74)
    r_img, _ = with_halo(fit(logo_r, height=r_h))
    w_img, _ = with_halo(fit(wordmark, width=w_w), blur_ratio=0.03, opacity=0.45)
    w_h = round(wordmark.height * w_w / wordmark.width)
    gap = round(size * 0.045)
    text_h = sum(s + g for _, s, _, g, _ in lines)
    total = r_h + gap + w_h + (gap * 1.6 + text_h if lines else 0)
    top = (size - total) / 2
    paste_center(canvas, r_img, size / 2, top + r_h / 2)
    paste_center(canvas, w_img, size / 2, top + r_h + gap + w_h / 2)
    draw = ImageDraw.Draw(canvas)
    y = top + r_h + gap + w_h + gap * 1.6
    for text, s, color, g, bold in lines:
        y += s
        text_center(draw, y, text, ImageFont.truetype(FONT_BOLD if bold else FONT_REG, s), color, size / 2)
        y += g
    return canvas


def main():
    src = Image.open(SRC).convert("RGBA")
    logo_full = trim(src)
    logo_r = trim(src.crop((0, 0, SPLIT_X, src.height)))
    wordmark = trim(src.crop((SPLIT_X, 0, src.width, src.height)))

    # Favicons e ícones de app
    master = {s: icon(s, logo_r) for s in (16, 32, 48, 64, 96, 180, 192, 512)}
    master[48].save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
                    append_images=[master[16], master[32]])
    for s in (48, 64, 96, 192, 512):
        master[s].save(PUBLIC / f"favicon-{s}.png", optimize=True)
    master[180].save(PUBLIC / "apple-touch-icon.png", optimize=True)

    # Logo quadrada com fundo sólido (dados estruturados / Google)
    stacked(1200, logo_r, wordmark).save(PUBLIC / "img" / "logo-square.png", optimize=True)

    tagline = [
        ("Seu negócio precisa de soluções digitais.", 46, WHITE, 18, True),
        ("A Raster Digital desenvolve.", 38, CYAN, 26, True),
        ("Sites · Lojas virtuais · Sistemas · Preço fechado", 26, MUTED, 0, False),
    ]
    # Compartilhamento: 16:9 (og:image), 4:3 e 1:1 — marca centralizada para sobreviver a recortes
    banner(1200, 630, logo_full, 600, tagline).save(PUBLIC / "img" / "og-raster.jpg", quality=88, optimize=True)
    banner(1200, 900, logo_full, 820, tagline).save(PUBLIC / "img" / "og-raster-4x3.jpg", quality=88, optimize=True)
    stacked(1200, logo_r, wordmark, lines=[
        ("Seu negócio precisa de soluções digitais.", 46, WHITE, 18, True),
        ("A Raster Digital desenvolve.", 40, CYAN, 0, True),
    ]).save(PUBLIC / "img" / "og-raster-1x1.jpg", quality=88, optimize=True)

    # Para enviar manualmente no Perfil da Empresa no Google
    PERFIL.mkdir(parents=True, exist_ok=True)
    icon(720, logo_r).save(PERFIL / "logo-perfil-720.png", optimize=True)
    banner(1200, 675, logo_full, 640, tagline).save(PERFIL / "capa-perfil-1200x675.jpg", quality=90, optimize=True)
    print("ok")


if __name__ == "__main__":
    main()
