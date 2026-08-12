import os

def list_files(folder_path):
    folder_path = folder_path.strip().strip('"').strip("'")

    if not os.path.isdir(folder_path):
        print(f"Error: '{folder_path}' is not a valid directory.")
        return

    output_lines = []

    for root, dirs, files in os.walk(folder_path):
        for file in files:
            full_path = os.path.join(root, file)
            relative_path = os.path.relpath(full_path, folder_path)
            output_lines.append(relative_path)

    if not output_lines:
        print("No files found in the specified folder.")
        return

    output_file = os.path.join(folder_path, "file_list.txt")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))

    print(f"\nFound {len(output_lines)} file(s):\n")
    for line in output_lines:
        print(line)

    print(f"\nSaved to: {output_file}")

if __name__ == "__main__":
    folder = input("Enter the folder path: ")
    list_files(folder)
