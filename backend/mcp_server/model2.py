import os
import sys

from langchain_mcp_adapters.client import MultiServerMCPClient


async def get_tools_client():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    server_path = os.path.join(base_dir, "server.py")

    client = MultiServerMCPClient(
        {
            "users": {
                "transport": "stdio",
                "command": sys.executable,
                "args": ["-u", server_path],
            }
        }
    )

    tools = await client.get_tools()
    return {tool.name: tool for tool in tools}