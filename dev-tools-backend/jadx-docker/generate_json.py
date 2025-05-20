import os
import json
import sys

def build_tree(base_path, current_path=""):
    full_path = os.path.join(base_path, current_path)

    tree = {
        "name": os.path.basename(current_path) if current_path else os.path.basename(base_path),
        "path": current_path.replace("\\", "/"),  # Ensure forward slashes
        "type": "directory",
        "children": []
    }

    try:
        for item in os.listdir(full_path):
            item_rel_path = os.path.join(current_path, item)
            item_full_path = os.path.join(base_path, item_rel_path)

            if os.path.isdir(item_full_path):
                tree["children"].append(build_tree(base_path, item_rel_path))
            else:
                tree["children"].append({
                    "name": item,
                    "path": item_rel_path.replace("\\", "/"),
                    "type": "file"
                })
    except Exception as e:
        print(f"Error reading directory {full_path}: {e}")

    return tree

if __name__ == "__main__":
    output_dir = sys.argv[1] if len(sys.argv) > 1 else "/output"

    if not os.path.exists(output_dir):
        print(f"❌ Error: Directory '{output_dir}' does not exist!")
        exit(1)

    print(f"📁 Building JSON structure for {output_dir}...")
    tree = build_tree(output_dir)

    json_path = os.path.join(output_dir, "structure.json")
    with open(json_path, "w") as f:
        json.dump(tree, f, indent=2)

    print(f"✅ structure.json created at {json_path}")
