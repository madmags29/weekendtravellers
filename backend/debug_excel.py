import pandas as pd
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
excel_path = os.path.join(base_dir, "..", "frontend", "master_destination.xlsx")
try:
    df = pd.read_excel(excel_path)
    print("Columns:", df.columns.tolist())
    print("Row 0:", df.iloc[0].to_dict())
    mask = df.apply(lambda x: x.astype(str).str.contains('Munnar', case=False).any(), axis=1)
    if not mask.any():
        print("Munnar NOT found in Excel.")
    else:
        print("Munnar FOUND in Excel:")
        print(df[mask])
except Exception as e:
    print(e)
