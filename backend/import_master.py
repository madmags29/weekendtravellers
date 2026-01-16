import pandas as pd
import json
import os

def import_master_excel():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    excel_path = os.path.join(base_dir, "..", "frontend", "master_destination.xlsx")
    json_path = os.path.join(base_dir, "data", "destinations.json")
    
    if not os.path.exists(excel_path):
        print(f"Excel file not found: {excel_path}")
        return

    print(f"Reading {excel_path}...")
    try:
        df = pd.read_excel(excel_path)
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return
    
    # Normalize columns
    df.columns = [str(c).strip() for c in df.columns]
    print(f"Detected columns: {df.columns.tolist()}")

    destinations = []
    seen_slugs = set()

    for index, row in df.iterrows():
        city = row.get("City") or row.get("Destination")
        if not city or pd.isna(city) or str(city).lower() == "nan":
            continue
            
        slug = str(city).lower().replace(" ", "-")
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)
        
        state = row.get("State/UT") or row.get("State")
        state_str = str(state).title() if state and not pd.isna(state) else "India"
        
        trip_type = row.get("Category") or row.get("Type") or "Leisure"
        desc = row.get("Long Description") or row.get("Short Description") or row.get("Description") or f"Explore {city}."
        famous_for = row.get("Famous For") or row.get("Destination Point") or trip_type
        price = row.get("Estimated Cost (₹)")
        
        # Best Time Generation (Since not explicitly in this file)
        # Simple heuristic based on known states
        best_time = "October to March"
        state_lower = str(state).lower()
        if "himachal" in state_lower or "uttarakhand" in state_lower or "kashmir" in state_lower:
             best_time = "March to June"
        elif "kerala" in state_lower or "goa" in state_lower or "south" in state_lower:
             best_time = "September to March"

        # Waypoints Generation
        waypoints = []
        if not pd.isna(row.get("Destination Point")):
             # Try to split by comma if multiple points listed? 
             # Or serves as one waypoint.
             pts = str(row.get("Destination Point"))
             if "," in pts:
                 waypoints = [p.strip() for p in pts.split(",")]
             else:
                 waypoints = [pts, "City Center"]
        
        if not waypoints:
            type_lower = str(trip_type).lower()
            if "beach" in type_lower:
                 waypoints = ["Main Beach", "Sunset Point"]
            elif "hill" in type_lower:
                 waypoints = ["Mall Road", "Viewpoint"]
            else:
                 waypoints = ["City Center", "Local Market"]

        dest_obj = {
            "id": len(destinations) + 1,
            "slug": slug,
            "Destination": str(city).title(),
            "State / UT": state_str,
            "Type": str(trip_type).title(),
            "Famous For": str(famous_for),
            "Short Description": str(desc),
            "Best Time to Visit": best_time,
            "Ideal Duration": "3 Days",
            "Suitable For": str(row.get("Weekend Friendly") or "Everyone"),
            "Price": f"₹{price}" if price else "₹5,000 - ₹15,000",
            "waypoints": waypoints,
            "distance_from_delhi": row.get("Distance from Delhi (km)"),
            "weekend_score": row.get("Weekend Score")
        }
        destinations.append(dest_obj)

    # Save to JSON
    output = {"destinations": destinations}
    with open(json_path, "w") as f:
        json.dump(output, f, indent=4)
        
    print(f"Successfully converted {len(destinations)} cities to destinations.json")

if __name__ == "__main__":
    import_master_excel()
