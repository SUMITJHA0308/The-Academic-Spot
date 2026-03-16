import pandas as pd
import sys
import os

subject = sys.argv[1]
chapter = sys.argv[2]

os.makedirs("processed", exist_ok=True)

# Find latest uploaded CSV
raw_files = os.listdir("raw_csvs")
latest_file = raw_files[-1]

df = pd.read_csv(f"raw_csvs/{latest_file}")

# Clean column names
df.columns = df.columns.str.strip()

# Inject subject + chapter
df["subject"] = subject
df["chapter"] = chapter

df.to_csv("processed/merged.csv", index=False)

print(f"Merge complete for {subject} - {chapter}")