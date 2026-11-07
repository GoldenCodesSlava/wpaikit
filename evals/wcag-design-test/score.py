"""Score a wcag-lint run against golden.json.

Usage: python3 -I score.py broken|clean RESULT.txt
       python3 -I score.py fixes FIXES.txt
RESULT.txt: one line per finding, `criterion|nodeId|severity|parentId` (the lint's `compact` output).
FIXES.txt: the lint's `fixes` output, `fix|nodeId|target|toHex|vs1,vs2|threshold|token`; every suggested
colour is re-checked here with an independent contrast implementation.
"""
import json, sys
from pathlib import Path

frame, path = sys.argv[1], sys.argv[2]

if frame == 'fixes':
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    def lum(h):
        r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    def ratio(a, b):
        x, y = sorted((lum(a), lum(b)), reverse=True)
        return (x + 0.05) / (y + 0.05)
    lines = [l.split('|') for l in Path(path).read_text().splitlines() if l.startswith('fix|')]
    bad = []
    for _, node, target, to, vs, thr, token in lines:
        worst = min(ratio(to, v) for v in vs.split(','))
        if worst < float(thr): bad.append(f"{node} {target} {to}{' (' + token + ')' if token else ''}: {worst:.2f} < {thr}")
    print(f"fixes checked: {len(lines)}, failing: {len(bad)}, tokens used: {sum(1 for l in lines if l[6])}")
    for b in bad: print('  ' + b)
    sys.exit(1 if bad else 0)
golden = json.loads((Path(__file__).parent / 'golden.json').read_text())
rows = [l.strip().split('|') for l in Path(path).read_text().splitlines() if l.strip() and not l.startswith('#')]
found = [dict(crit=r[0], node=r[1], sev=r[2], parent=r[3] if len(r) > 3 else '') for r in rows]

def hits(f, node_ids, crits):
    return f['crit'] in crits and (f['node'] in node_ids or f['parent'] in node_ids)

def false_positives(entries):
    return [(n.get('id', n['nodeId']), f) for n in entries for f in found if hits(f, {n['nodeId']}, set(n['criteria']))]

if frame == 'broken':
    exp, used = golden['broken']['expected'], set()
    matched, missed, sev_diff = [], [], []
    for e in exp:
        ids = {e['nodeId'], *e.get('alsoNodeIds', [])}
        crits = {e['criterion'], *e.get('alsoCriteria', [])}
        m = [i for i, f in enumerate(found) if hits(f, ids, crits)]
        if m:
            matched.append(e); used.update(m)
            sevs = {found[i]['sev'] for i in m}
            if e['severity'] not in sevs: sev_diff.append(f"{e['id']} {e['criterion']}: golden {e['severity']}, got {'/'.join(sorted(sevs))}")
        else:
            missed.append(e)
    by_group = {}
    for e in exp:
        g = by_group.setdefault(e['group'], [0, 0]); g[1] += 1
        if e in matched: g[0] += 1
    print(f"matched {len(matched)}/{len(exp)}")
    for g, (a, b) in sorted(by_group.items()): print(f"  {g:10} {a}/{b} = {100 * a // b}%")
    print('missed:'); [print(f"  {e['id']} {e['criterion']} {e['nodeId']} {e['layer']} [{e['group']}]") for e in missed]
    print('severity differences:'); [print('  ' + s) for s in sev_diff]
    fp = false_positives(golden['broken']['mustNotFlag'])
    print(f"mustNotFlag hits: {len(fp)}"); [print(f"  {i}: {f}") for i, f in fp]
    opt = [(o["nodeId"], o["criterion"]) for o in golden["broken"].get("optional", [])]
    extra = [f for i, f in enumerate(found) if i not in used and (f["node"], f["crit"]) not in opt]
    print(f"extra findings (not in golden): {len(extra)}"); [print(f"  {f['crit']} {f['node']} {f['sev']}") for f in extra]
else:
    bad = [f for f in found if f['sev'] in ('critical', 'serious')]
    print(f"critical/serious on clean: {len(bad)}"); [print(f"  {f}") for f in bad]
    fp = false_positives(golden['clean']['mustNotFlag'])
    print(f"mustNotFlag hits: {len(fp)}"); [print(f"  {i}: {f}") for i, f in fp]
    print('other:'); [print(f"  {f['crit']} {f['node']} {f['sev']}") for f in found if f not in bad]
