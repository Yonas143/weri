# Setting Up MCP on Google Cloud VM

## What is MCP?
Model Context Protocol (MCP) is a protocol that allows AI assistants to interact with external tools and data sources. You can expose your backend API as MCP tools.

## Option 1: Install MCP Server on VM (Recommended)

### Step 1: Install UV (Python Package Manager)
```bash
# SSH into your VM
gcloud compute ssh ethioradio-backend --zone=us-central1-a --project=gen-lang-client-0971771385

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env
```

### Step 2: Create MCP Server Configuration

Create a simple MCP server that exposes your API endpoints:

```bash
cd ~/weri
mkdir mcp-server
cd mcp-server

# Create a simple MCP server using FastMCP
cat > server.py << 'EOF'
from fastmcp import FastMCP
import httpx
import os

mcp = FastMCP("EthioRadio API")

BASE_URL = "http://localhost:3000/api"

@mcp.tool()
async def get_stations():
    """Get all radio stations"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/stations")
        return response.json()

@mcp.tool()
async def get_recordings():
    """Get all recordings"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/recordings")
        return response.json()

@mcp.tool()
async def get_status():
    """Get system status"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/status")
        return response.json()

@mcp.tool()
async def create_recording_request(station_id: str, duration_minutes: int, notes: str = ""):
    """Create a new recording request"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/recording-requests",
            json={
                "stationId": station_id,
                "durationMinutes": duration_minutes,
                "notes": notes
            }
        )
        return response.json()

if __name__ == "__main__":
    mcp.run()
EOF
```

### Step 3: Install Dependencies and Run

```bash
# Install FastMCP
uvx fastmcp install

# Run the MCP server (it will listen on stdio by default)
uvx fastmcp run server.py
```

### Step 4: Configure Firewall for MCP (if using HTTP transport)

If you want to expose MCP over HTTP instead of stdio:

```bash
# Add firewall rule for MCP port (e.g., 8080)
gcloud compute firewall-rules create allow-mcp \
  --project=gen-lang-client-0971771385 \
  --allow=tcp:8080 \
  --source-ranges=0.0.0.0/0 \
  --description="Allow MCP server access"
```

## Option 2: Use MCP Client Locally

Instead of running MCP on the VM, you can configure your local Kiro to connect to your backend API via MCP.

### Local MCP Configuration (~/.kiro/settings/mcp.json)

```json
{
  "mcpServers": {
    "ethioradio-api": {
      "command": "uvx",
      "args": ["fastmcp", "run", "/path/to/local