"""Tek dosyalık önizleme sayfası üretir: js dosyalarını içine gömer, Blockly'yi jsdelivr'den yükler.
Kullanım (proje klasöründe, Komut İstemi): python tools/build_preview.py cikti.html"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'afi-kod-onizleme.html')
CDN = 'https://cdn.jsdelivr.net/npm/blockly@11.2.2/'
html = (root / 'index.html').read_text(encoding='utf-8')
def rep(m):
    src = m.group(1).split('?')[0]
    if src.startswith('lib/'):
        name = src[4:]
        return '<script src="%s%s"></script>' % (CDN, name)
    code = (root / src).read_text(encoding='utf-8').replace('</script', '<\\/script')
    return '<script>\n' + code + '\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', rep, html)
html = html.replace("media: 'lib/media/'", "media: '%smedia/'" % CDN)
out.write_text(html, encoding='utf-8')
print(out, round(len(html.encode()) / 1024), 'KB')
