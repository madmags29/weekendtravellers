import pandas as pd
import json
import re
import os

# Paths
EXCEL_PATH = "../frontend/Indian_Travel_100plus_Segmented.xlsx"
OUTPUT_JSON = "data/destinations.json"

def clean_key(key):
    """Remove content in parentheses from keys, e.g., 'Duration (Days)' -> 'Duration'"""
    return re.sub(r'\s*\(.*?\)', '', key).strip()

def generate_slug(name):
    """Generate a URL-friendly slug from the name."""
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

def load_data():
    if not os.path.exists(EXCEL_PATH):
        print(f"Error: File not found at {EXCEL_PATH}")
        return

    try:
        df = pd.read_excel(EXCEL_PATH)
        
        destinations = []
        for index, row in df.iterrows():
            item = {}
            # Clean keys and build item
            for col in df.columns:
                clean_col = clean_key(col)
                val = row[col]
                
                # Handle NaN/None
                if pd.isna(val):
                    val = None
                else:
                    val = str(val).strip()
                
                item[clean_col] = val
            
            # Add metadata
            if item.get("Destination"):
                item["id"] = index + 1
                item["slug"] = generate_slug(item["Destination"])
                destinations.append(item)
            
        # Ensure output directory exists
        os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
        
        with open(OUTPUT_JSON, 'w') as f:
            json.dump({"destinations": destinations}, f, indent=2)
            
        print(f"Successfully loaded {len(destinations)} destinations to {OUTPUT_JSON}")
        
    except Exception as e:
        print(f"Error processing Excel: {e}")

if __name__ == "__main__":
    load_data()
