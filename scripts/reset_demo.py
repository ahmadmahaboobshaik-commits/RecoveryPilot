import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
from backend.scripts.reset_demo import reset_demo_data

if __name__ == "__main__":
    reset_demo_data()
