from langchain_core.messages import ToolMessage
from backend.mcp_server.tools import tools_by_name

def tool_node(state):

    results = []

    last_message = state["messages"][-1]

    for tool_call in last_message.tool_calls:

        tool = tools_by_name[tool_call["name"]]

        result = tool.invoke(
            tool_call["args"]
        )

        results.append(
            ToolMessage(
                content=str(result),
                tool_call_id=tool_call["id"]
            )
        )

    return {
        "messages": results,
        "intent": None,
        "pending_field": None,
        "nombre": None,
        "cedula": None,
        "email": None,
        "celular": None
    }