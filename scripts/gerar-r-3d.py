"""Gera os dados do "R" 3D do topo do site a partir da logo original.

Saídas:
  public/img/r-mark.webp  textura da face da frente (arte original do "R", fundo transparente);
                          também é a imagem do topo sem WebGL
  src/three/rShape.json   contorno do "R" (polígonos) para extrudar no Three.js

Uso (na raiz do projeto):  python scripts/gerar-r-3d.py
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "brand" / "logo-original.png"
SPLIT_X = 704          # coluna vazia entre o "R" e o texto RASTER
TEX_W = 720            # largura da textura publicada
ALPHA_CUT = 150        # o que conta como "corpo" do R (o resto é brilho)
OPEN_PX = 7            # abertura morfológica: limpa serrilhado do brilho
STAR_ZONE_X = 225      # acima de STAR_ZONE_Y e à esquerda disso, só a ponta da barra entra no sólido
STAR_ZONE_Y = 215      # abaixo começa a perna diagonal do R
STAR = (130, 100)      # centro da estrela na textura (px)


DIRS = [(-1, 0), (-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1)]  # W NW N NE E SE S SW


def trace(px, w, h, start, inside):
    """Contorno de Moore a partir de um pixel cujo vizinho da esquerda está fora."""
    def on(p):
        x, y = p
        return 0 <= x < w and 0 <= y < h and inside(px[x, y])

    contour = [start]
    c, b = start, (start[0] - 1, start[1])
    first_next = None
    for _ in range(w * h * 4):
        i = DIRS.index((b[0] - c[0], b[1] - c[1]))
        for k in range(1, 9):
            d = DIRS[(i + k) % 8]
            n = (c[0] + d[0], c[1] + d[1])
            if on(n):
                pd = DIRS[(i + k - 1) % 8]
                b, c = (c[0] + pd[0], c[1] + pd[1]), n
                break
        else:
            return contour
        if first_next is None:
            first_next = c
        elif contour[-1] == start and c == first_next:
            contour.pop()
            return contour
        contour.append(c)
    return contour


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = (dx * dx + dy * dy) ** 0.5 or 1e-9
    best, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i]
        d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm
        if d > best:
            best, idx = d, i
    if best > eps:
        return rdp(pts[: idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]


def simplify_closed(pts, eps):
    # divide no ponto mais distante do primeiro para o RDP funcionar em polígono fechado
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
    a = rdp(pts[: far + 1], eps)
    b = rdp(pts[far:] + [pts[0]], eps)
    return a[:-1] + b[:-1]


def area(poly):
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1])) / 2


def main():
    src = Image.open(SRC).convert("RGBA")
    r = src.crop((0, 0, SPLIT_X, src.height))
    r = r.crop(r.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
    scale = TEX_W / r.width
    tex = r.resize((TEX_W, round(r.height * scale)), Image.LANCZOS)
    tex.save(ROOT / "public" / "img" / "r-mark.webp", quality=88, method=6)
    W, H = tex.size

    mask = tex.getchannel("A").point(lambda v: 255 if v > ALPHA_CUT else 0)
    mask = mask.filter(ImageFilter.MinFilter(OPEN_PX)).filter(ImageFilter.MaxFilter(OPEN_PX))
    # Estrela: sai do sólido (vira um brilho no 3D). Perto dela, a barra de cima é uma cunha
    # entre y=95,5 e a borda inferior diagonal, que termina em ponta por volta de x=100.
    mp = mask.load()
    for x in range(0, STAR_ZONE_X):
        bottom = 142 + 0.717 * (x - 160)
        for y in range(STAR_ZONE_Y):
            if mp[x, y] and not (x >= 100 and 95.5 <= y <= bottom):
                mp[x, y] = 0
    # buracos: fundo que não se liga à borda
    pad = Image.new("L", (W + 2, H + 2), 0)
    pad.paste(mask, (1, 1))
    ImageDraw.floodfill(pad, (0, 0), 100)
    pad = pad.crop((1, 1, W + 1, H + 1))
    px = pad.load()

    shapes, holes = [], []
    seen = Image.new("1", (W, H), 0)
    sp = seen.load()
    # sólido: começa onde o vizinho da esquerda é o fundo externo (100); buraco: onde é sólido
    passes = (
        ("solid", lambda v: v == 255, lambda x, y: x == 0 or px[x - 1, y] == 100),
        ("hole", lambda v: v == 0, lambda x, y: x > 0 and px[x - 1, y] == 255),
    )
    for kind, inside, starts in passes:
        for y in range(H):
            for x in range(W):
                if inside(px[x, y]) and not sp[x, y] and starts(x, y):
                    # só começa contornos novos (pixel de borda ainda não visitado)
                    c = trace(px, W, H, (x, y), inside)
                    for p in c:
                        sp[p] = 1
                    if len(c) < 40:
                        continue
                    poly = simplify_closed(c, 0.9)
                    if abs(area(poly)) < 400:
                        continue
                    (shapes if kind == "solid" else holes).append(poly)
        seen = Image.new("1", (W, H), 0)
        sp = seen.load()

    # contornos internos de um mesmo sólido (quando o traçado reencontra a mesma borda) são removidos por área
    shapes.sort(key=lambda p: -abs(area(p)))
    out = {
        "width": W,
        "height": H,
        "star": list(STAR),
        "shapes": [[[round(x, 1), round(y, 1)] for x, y in p] for p in shapes],
        "holes": [[[round(x, 1), round(y, 1)] for x, y in p] for p in holes],
    }
    dest = ROOT / "src" / "three" / "rShape.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, separators=(",", ":")))
    print(f"textura {W}x{H} | sólidos {[len(p) for p in shapes]} áreas {[round(abs(area(p))) for p in shapes]}"
          f" | buracos {[len(p) for p in holes]}")

    # prévia para conferência
    prev = Image.new("RGBA", (W, H), (3, 8, 20, 255))
    prev.alpha_composite(tex)
    d = ImageDraw.Draw(prev)
    for p in shapes:
        d.line(p + p[:1], fill=(255, 60, 60, 255), width=2)
    for p in holes:
        d.line(p + p[:1], fill=(60, 255, 60, 255), width=2)
    return prev


if __name__ == "__main__":
    import sys
    preview = main()
    if len(sys.argv) > 1:
        preview.save(sys.argv[1])
