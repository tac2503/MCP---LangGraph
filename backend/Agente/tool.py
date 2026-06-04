from langchain_core.messages import ToolMessage, HumanMessage
from backend.Agente.nodes import tools_by_name
from backend.mcp_server.model import get_model


async def tool_node(state):
    model = get_model()
    tool = tools_by_name[state["selected_tool"]]
    result = await tool.ainvoke(state["tool_args"])
    natural_result = model.invoke([
        HumanMessage(content=f"""
        El resultado de la herramienta {state["selected_tool"]} es:
        {result}
        
        Necesito que acoples esa respuesta y la acoples a lenguaje natural y amigable para el usuario
        
        """
            
        )
    ])
    return {
        "messages":[
            ToolMessage(
                content=str(natural_result.content),
                tool_call_id="final"
            )
        ],
        "selected_tool": None,
        "tool_args": {},
        "missing_fields": [],
        "pending_field": None,
    }