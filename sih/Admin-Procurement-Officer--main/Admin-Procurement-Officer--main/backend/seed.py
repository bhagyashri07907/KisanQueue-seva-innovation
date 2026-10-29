"""
[REFERENCE ONLY / PROTOTYPE SCRIPT]
Note: The active and verified backend seed script for KisanQueue is located at:
KisanQueue_backend_starter/KisanQueue_backend/seed.py

This prototype script is aligned with the active database configuration:
Database: 'kisanqueue'
"""

import json
import os
import sys

def seed_database():
    try:
        from pymongo import MongoClient
    except ImportError:
        print("pymongo not installed. To run this script: pip install pymongo")
        return

    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.environ.get("MONGO_DB", os.environ.get("DB_NAME", "kisanqueue"))
    
    print(f"Connecting to MongoDB database: '{db_name}' at {mongo_uri}...")
    client = MongoClient(mongo_uri)
    db = client[db_name]

    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    
    files_to_collections = {
        "procurement_centers.json": "procurement_centers",
        "officers.json": "officers",
        "admins.json": "admins",
        "farmers.json": "farmers",
        "slots.json": "slots",
        "bookings.json": "bookings",
        "procurements.json": "procurements",
        "payments.json": "payments"
    }

    reset_requested = "--reset" in sys.argv
    if not reset_requested:
        print("Safety Notice: To avoid wiping active bookings or demo records, this script requires '--reset' to drop collections.")
        print("For active project development, run: python KisanQueue_backend_starter/KisanQueue_backend/seed.py")
        return

    for file_name, collection_name in files_to_collections.items():
        file_path = os.path.join(data_dir, file_name)
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if data:
                db[collection_name].drop()
                db[collection_name].insert_many(data)
                print(f"✓ Seeded {len(data)} documents into '{collection_name}' collection.")
        else:
            print(f"Warning: File {file_path} not found.")

    # Create indexes
    db.procurement_centers.create_index("center_id", unique=True)
    db.officers.create_index("officer_id", unique=True)
    db.bookings.create_index("digital_token", unique=True)
    db.bookings.create_index("booking_id", unique=True)
    db.slots.create_index("slot_id", unique=True)
    db.procurements.create_index("procurement_id", unique=True)
    db.payments.create_index("payment_id", unique=True)
    
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
