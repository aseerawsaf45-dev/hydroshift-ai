"""
Automated Clean Audit & Submission Packager for NASA Space Apps Challenge 2026.
Creates an auditable, reproducible zip bundle of the swot-khulna project:
- Includes: core source code, tests, documentation, ML weights, and scientific manifests.
- Excludes: .git, .venv, node_modules, .next, __pycache__, and temporary logs.
"""

import os
import sys
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_ZIP = os.path.join(ROOT_DIR, "swot_khulna_audit_package.zip")
ARTIFACT_DIR = r"C:\Users\PC\.gemini\antigravity-ide\brain\ccdb04eb-75a2-414b-9a90-569cc701289e"

EXCLUDE_DIRS = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    ".next",
    ".pytest_cache",
    ".turbo",
    "__pycache__",
    ".system_generated",
    "dist",
    "build"
}

EXCLUDE_EXTS = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".log"
}

def create_audit_package():
    print(f"Creating clean audit package at: {OUTPUT_ZIP}")
    file_count = 0
    total_uncompressed_bytes = 0

    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]

            for file in files:
                if file.startswith(".env") and file != ".env.example":
                    continue
                if file == "swot_khulna_audit_package.zip":
                    continue
                _, ext = os.path.splitext(file)
                if ext in EXCLUDE_EXTS:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ROOT_DIR)

                zipf.write(full_path, arcname=rel_path)
                file_count += 1
                total_uncompressed_bytes += os.path.getsize(full_path)

    zip_size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"Successfully packaged {file_count} files ({zip_size_mb:.2f} MB compressed, {total_uncompressed_bytes / (1024 * 1024):.2f} MB raw).")

    # Mirror to IDE artifact directory if present
    if os.path.exists(ARTIFACT_DIR):
        dest = os.path.join(ARTIFACT_DIR, "swot_khulna_audit_package.zip")
        shutil.copy2(OUTPUT_ZIP, dest)
        print(f"Mirrored submission package to IDE artifact: {dest}")

    return OUTPUT_ZIP

if __name__ == "__main__":
    create_audit_package()
