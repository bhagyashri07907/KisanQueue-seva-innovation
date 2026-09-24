"""
KisanQueue Web Portal - MongoDB Seed Script
This script seeds the synthetic government-provided dataset into MongoDB collections.

Collections:
- admins
- officers
- procurement_centers
- slots
- farmers
- bookings
- tokens
- procurements
- payments
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
    db_name = os.environ.get("DB_NAME", "kisanqueue_db")
    
    print(f"Connecting to MongoDB at {mongo_uri}...")
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

    for file_name, collection_name in files_to_collections.items():
        file_path = os.path.join(data_dir, file_name)
        if os.path.exists(file_path):
            with open(file_path, "r") as f:
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
