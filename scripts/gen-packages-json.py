#!/usr/bin/env python3

import sys, json, glob, re
from pathlib import Path

index_json_name = '_packages.json'

def main():
    root = Path(sys.argv[1])

    packages = []
    for filename in root.iterdir():
        match = re.match(r"([a-z-]+)\.json", filename.name)
        if not match:
            if filename.name != index_json_name and filename.name.endswith(".json"):
                raise ValueError("Package name invalid", filename)
            continue
        package_name = match[1]
        packages.append(package_name)

    with open(root / index_json_name, 'w') as f:
        json.dump(packages, f)

if __name__ == '__main__':
    main()
