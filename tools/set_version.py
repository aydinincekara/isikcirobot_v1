"""Sürüm numarasını tek komutla günceller: js/version.js ve index.html'deki ?v= etiketleri.
Kullanım (proje klasöründe, Komut İstemi): python tools/set_version.py 2.3"""
import re, sys, pathlib
v = sys.argv[1]
root = pathlib.Path(__file__).resolve().parent.parent
vj = root / 'js' / 'version.js'
vj.write_text(re.sub(r"AFI_VERSION = '[^']*'", "AFI_VERSION = '%s'" % v, vj.read_text(encoding='utf-8')), encoding='utf-8')
ix = root / 'index.html'
ix.write_text(re.sub(r'(<script src="js/[^"?]+)(\?v=[^"]*)?"', r'\1?v=%s"' % v, ix.read_text(encoding='utf-8')), encoding='utf-8')
print('sürüm', v)
