import json

def extract_ethiopian_places():
    try:
        with open('places_temp.json', 'r') as f:
            data = json.load(f)
        
        places = data.get('data', {}).get('list', [])
        ethiopia_places = [p for p in places if p.get('country') == 'Ethiopia']
        
        print(json.dumps(ethiopia_places))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_ethiopian_places()
