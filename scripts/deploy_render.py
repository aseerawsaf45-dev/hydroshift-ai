#!/usr/bin/env python3
"""
Automated Render Deployment Script for HydroShift AI
Deploys the Next.js web service from a PUBLIC GitHub repository
using the Render REST API v1 POST /services endpoint.

Usage:
  python scripts/deploy_render.py              # reads RENDER_API_KEY env var
  python scripts/deploy_render.py <key>        # CLI arg (DO NOT commit key!)
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error

RENDER_API  = "https://api.render.com/v1"
GITHUB_REPO = "https://github.com/aseerawsaf45-dev/hydroshift-ai"
BRANCH      = "master"
SERVICE_NAME = "hydroshift-ai"


def api_call(method: str, path: str, body=None, *, key: str):
    headers = {
        "Authorization": f"Bearer {key.strip()}",
        "Content-Type":  "application/json",
        "Accept":        "application/json",
    }
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{RENDER_API}{path}", data=data, headers=headers, method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        msg = exc.read().decode()
        raise RuntimeError(f"HTTP {exc.code} on {method} {path}: {msg}") from None


def deploy(key: str):
    # 1 — Authenticate
    print("[1/4] Authenticating with Render API...")
    owners = api_call("GET", "/owners", key=key)
    if not owners:
        print("[Error] No owner found for this API key.")
        sys.exit(1)
    owner_id   = owners[0]["owner"]["id"]
    owner_name = owners[0]["owner"].get("name", "?")
    print(f"  -> Authenticated as: {owner_name}  (owner ID: {owner_id})")

    # 2 — Create Web Service (public repo — no GitHub App auth needed)
    print(f"[2/4] Creating Web Service '{SERVICE_NAME}'...")
    payload = {
        "type":       "web_service",
        "name":       SERVICE_NAME,
        "ownerId":    owner_id,
        "repo":       GITHUB_REPO,
        "branch":     BRANCH,
        "autoDeploy": "yes",
        "serviceDetails": {
            "env":          "node",
            "plan":         "free",
            "envSpecificDetails": {
                "buildCommand": "pnpm install && pnpm build",
                "startCommand": "pnpm start",
            },
            "envVars": [
                {"key": "NODE_VERSION",            "value": "20.18.0"},
                {"key": "NEXT_PUBLIC_API_BASE_URL", "value": "https://swot-khulna-api.onrender.com"},
            ],
        },
    }

    service_id  = None
    service_url = None

    try:
        result      = api_call("POST", "/services", payload, key=key)
        service_id  = result.get("service", {}).get("id")
        service_url = (result.get("service", {}).get("serviceDetails") or {}).get("url")
        print(f"  -> Created service  ID: {service_id}")
        print(f"  -> Assigned URL       : {service_url}")
    except RuntimeError as exc:
        err_str = str(exc)
        err_lower = err_str.lower()
        if "already exists" in err_lower or "unique" in err_lower or "already in use" in err_lower or "in use" in err_lower:
            print("  -> Service already exists — looking it up...")
            existing = api_call("GET", f"/services?name={SERVICE_NAME}&limit=10", key=key)
            for item in (existing or []):
                svc = item.get("service", {})
                if svc.get("name") == SERVICE_NAME:
                    service_id  = svc["id"]
                    service_url = (svc.get("serviceDetails") or {}).get("url")
                    print(f"  -> Found existing service ID: {service_id}")
                    print(f"  -> Triggering new deploy with updated settings...")
                    deploy_res = api_call("POST", f"/services/{service_id}/deploys", {"clearCache": "clear"}, key=key)
                    print(f"  -> Triggered deploy ID: {deploy_res.get('id')}")
                    break
            if not service_id:
                print(f"[Error] Could not find or create service.\n{exc}")
                sys.exit(1)
        else:
            print(f"\n[Error] Service creation failed:\n  {exc}")
            print("\n[Fallback] Open this URL in your browser to authorize and deploy:")
            print(f"\n  https://render.com/deploy?repo={GITHUB_REPO}\n")
            sys.exit(2)

    # 3 — Poll deploy status (max 10 min)
    print("[3/4] Waiting for first deploy to complete (3–8 min typical)...")
    deadline = time.time() + 600
    while time.time() < deadline:
        time.sleep(20)
        try:
            deploys = api_call("GET", f"/services/{service_id}/deploys?limit=1", key=key)
            if deploys:
                deploy_obj = deploys[0].get("deploy", {})
                state  = deploy_obj.get("status", "")
                commit = deploy_obj.get("commit", {}).get("id", "")[:7]
                print(f"  ... deploy status: {state}  (commit {commit})", flush=True)
                if state in ("live", "succeeded"):
                    break
                if state in ("failed", "canceled", "error", "build_failed", "update_failed"):
                    print(f"[Error] Deploy failed with status: {state}", flush=True)
                    print(f"  Check https://dashboard.render.com/ for logs.", flush=True)
                    sys.exit(1)
        except RuntimeError:
            pass  # transient — keep polling

    # 4 — Report
    print("\n[4/4] Done!", flush=True)
    if not service_url:
        # Re-fetch the URL after deploy
        try:
            svc_data    = api_call("GET", f"/services/{service_id}", key=key)
            service_url = (svc_data.get("serviceDetails") or {}).get("url")
        except RuntimeError:
            pass

    if service_url:
        formatted_url = service_url if service_url.startswith("http") else f"https://{service_url}"
        print(f"\n  Live Site URL : {formatted_url}", flush=True)
    else:
        print("  URL not yet assigned — visit https://dashboard.render.com/", flush=True)
    print(f"  Service ID    : {service_id}")
    print("  Auto-deploy   : enabled (every push to master)")
    print("  Dashboard     : https://dashboard.render.com/")


if __name__ == "__main__":
    key = os.environ.get("RENDER_API_KEY")
    if not key and len(sys.argv) > 1:
        key = sys.argv[1]
    if not key:
        print("Usage: python scripts/deploy_render.py <RENDER_API_KEY>")
        print("   or: set RENDER_API_KEY=<key>  then  python scripts/deploy_render.py")
        sys.exit(1)
    deploy(key)
