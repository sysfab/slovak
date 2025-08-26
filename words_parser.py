filenames = [
    "base.lst",
    "invalid.lst",
    "slang.lst",
    "vulgar_obsc.lst",
    "vulgar.lst",
    "other.txt"
]

_lines = []
words = []
for filename in filenames:
    with open(filename, "r") as f:
        lines = f.readlines()
        _lines.extend(lines)

for line in _lines:
    if line.startswith(" "):
        continue
    words.append(line.split()[0])

filtered_words = []
for word in words:
    if len(word) != 6:
        continue

    if "`" in word:
        continue

    if "'" in word:
        continue

    if "-" in word:
        continue

    filtered_words.append(word)

with open("words.txt", "w") as f:
    for word in filtered_words:
        f.write(word + "\n")
print("Done!")