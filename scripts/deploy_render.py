#!/usr/bin/env python3
"""
Automated Render Deployment Script for HydroShift AI
Uses the Render REST API (v1) to deploy either:
1. Complete Blueprint (via render.yaml)
2. Standalone Next.js Web Service (instant free tier)
"""

import os
import sys
import json
import urllib.request
import urllib.error

RENDER_API_ENDPOINT = "https://api.render.com/v1"
GITHUB_REPO = "https://github.com/aseerawsaf45-dev/hydroshift-ai"

def deploy(api_key: str, branch: str = "master"):
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Step 1: Validate API key and get Owner ID
    print("[1/3] Authenticating with Render API...")
    req = urllib.request.Request(f"{RENDER_API_ENDPOINT}/owners", headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            owners_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[Error] Authentication failed ({e.code}): {e.read().decode('utf-8')}")
        sys.exit(1)

    if not owners_data or len(owners_data) == 0:
        print("[Error] No owner account found for this API key.")
        sys.exit(1)

    owner_id = owners_data[0]["owner"]["id"]
    owner_name = owners_data[0]["owner"].get("name", "Account")
    print(f"  -> Authenticated as: {owner_name} (ID: {owner_id})")

    # Step 2: Create Web Service
    service_name = f"hydroshift-ai-{branch}"
    print(f"[2/3] Provisioning Web Service '{service_name}' on Render...")

    payload = {
        "type": "web_service",
        "name": service_name,
        "ownerId": owner_id,
        "repo": GITHUB_REPO,
        "branch": branch,
        "autoDeploy": "yes",
        "serviceDetails": {
            "env": "node",
            "buildCommand": "pnpm install && pnpm --filter web build",
            "startCommand": "pnpm --filter web start",
            "plan": "free",
            "envVars": [
                {
                    "key": "NEXT_PUBLIC_API_BASE_URL",
                    "value": "https://swot-khulna-api.onrender.com"
                },
                {
                    "key": "NODE_VERSION",
                    "value": "20.18.0"
                }
            ]
        }
    }

    req = urllib.request.Request(
        f"{RENDER_API_ENDPOINT}/services",
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            service_data = json.loads(resp.read().decode("utf-8"))
            service_id = service_data.get("service", {}).get("id")
            service_url = service_data.get("service", {}).get("serviceDetails", {}).get("url")
            print(f"  -> Successfully created service ID: {service_id}")
            print(f"  -> Assigned URL: {service_url}")
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        # Check if already exists
        if "already exists" in error_msg.lower() or "unique" in error_msg.lower():
            print(f"  -> Service '{service_name}' already exists. Triggering re-deploy...")
            # Query existing service
            req_list = urllib.request.Request(f"{RENDER_API_ENDPOINT}/services?name={service_name}", headers=headers)
            with urllib.request.urlopen(req_list) as resp_list:
                existing = json.loads(resp_list.read().decode("utf-8"))
                if existing:
                    service_id = existing[0]["service"]["id"]
                    service_url = existing[0]["service"].get("serviceDetails", {}).get("url")
                    # Trigger deploy
                    req_deploy = urllib.request.Request(
                        f"{RENDER_API_ENDPOINT}/services/{service_id}/deploys",
                        data=json.dumps({}).encode("utf-8"),
                        headers=headers,
                        method="POST"
                    )
                    with urllib.request.urlopen(req_deploy) as rd:
                        print(f"  -> Triggered deployment for {service_id}")
                else:
                    print(f"[Error] Could not find service: {error_msg}")
                    sys.exit(1)
        else:
            print(f"[Error] Failed to create service ({e.code}): {error_msg}")
            sys.exit(1)

    print("\n[3/3] Deployment Pipeline Launched!")
    print(f"Live Service URL: {service_url}")
    print(f"Monitor Dashboard: https://dashboard.render.com/")

if __name__ == "__main__":
    key = os.environ.get("RENDER_API_KEY")
    if not key and len(sys.argv) > 1:
        key = sys.argv[1]
    
    if not key:
        print("Usage: python scripts/deploy_render.py <RENDER_API_KEY>")
        print("Or set RENDER_API_KEY environment variable.")
        sys.exit(1)

    deploy(key)
