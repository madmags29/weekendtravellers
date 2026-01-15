import pandas as pd
import json
import sys

file_path = "../frontend/Indian_Travel_Master_Weekend_With_Descriptions.xlsx"

try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("Row count:", len(df))
    
    # specific inspection of first row
    first_row = df.iloc[0].to_dict()
    # Handle timestamps or non-serializable objects
    for k, v in first_row.items():
        if pd.isna(v):
            first_row[k] = None
        else:
            first_row[k] = str(v)
            
    print("First Row Sample:")
    print(json.dumps(first_row, indent=2))
    
    # Check for 'Slug' or ID column
    if 'Slug' not in df.columns and 'id' not in df.columns:
        print("WARNING: No explicit ID or Slug column found for routing.")

except Exception as e:
    print(f"Error reading excel: {e}")
