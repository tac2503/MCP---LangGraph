from backend.mcp_server.model import get_model
from backend.mcp_server.tools import tools

def build_agent():
    model = get_model()
    model_with_tools=model.bind_tools(tools)
    return model_with_tools
