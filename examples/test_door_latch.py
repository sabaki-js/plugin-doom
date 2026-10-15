"""Test latch open_door (pur, sans VizDoom). Usage: python3 test_door_latch.py"""
import ast, textwrap

SRC = "/home/lsannier/sabaki-js/plugin-doom/examples/drive_serve.py"
src = open(SRC).read()
tree = ast.parse(src)
want = {"latch_door", "latch_target"}
segs = []
for n in ast.walk(tree):
    if isinstance(n, ast.FunctionDef) and n.name in want:
        segs.append(textwrap.dedent("\n".join(src.splitlines()[n.lineno - 1:n.end_lineno])))
ns = {}
exec(compile("\n\n".join(segs), "latch", "exec"), ns)
latch_door, latch_target = ns["latch_door"], ns["latch_target"]

door = {"id": 7, "distance": 300}
ok = 0

# 1. porte choisie -> verrouillée même si le modèle change d'avis
st = {}
a, st = latch_door(st, "open_door", {"door": door}, 100)
assert a == "open_door", a
a, st = latch_door(st, "exit", {"door": door}, 101)
assert a == "open_door", a
ok += 1; print("PASS latch maintenu malgré oscillation")

# 2. expire après hold
a, st = latch_door(st, "exit", {"door": door}, 100 + 15)
assert a == "exit" and "door_latch" not in st, (a, st)
ok += 1; print("PASS expiration hold")

# 3. sans porte : pas de latch
st = {}
a, st = latch_door(st, "open_door", {}, 0)
assert a == "open_door" and "door_latch" not in st, (a, st)
ok += 1; print("PASS pas de latch sans porte")

# 4. cible mémorisée pendant un trou de capteurs
st = {}
latch_door(st, "open_door", {"door": door}, 50)
assert latch_target(st, "open_door", {}) == door
assert latch_target(st, "open_door", {"door": {"id": 8}})["id"] == 8
assert latch_target(st, "exit", {}) is None
ok += 1; print("PASS cible mémorisée")

print(f"door_latch: {ok}/4")
