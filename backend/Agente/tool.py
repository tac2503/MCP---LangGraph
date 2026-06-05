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
        
        Necesito que acoples esa respuesta y la acoples a lenguaje natural y amigable para el usuario. Sin decir nada como "aqui tienes una respuesta mas amigable"
        Simplemente dame la respuesta final en lenguaje natural, sin mencionar que es una respuesta procesada o algo por el estilo. Solo dame la respuesta final, nada mas.
        
        """
            
        )
    ]).content
    if isinstance(natural_result, str):
        natural_result=natural_result.strip()
    elif isinstance(natural_result,list):
        natural_result="".join(
            part.get("text","") if isinstance(part,dict) else str(part)
            for part in natural_result
        ).strip()
    else:
        natural_result=str(natural_result).strip()
    return {
        "messages":[
            ToolMessage(
                content=str(natural_result),
                tool_call_id="final"
            )
        ],
        "selected_tool": None,
        "tool_args": {},
        "missing_fields": [],
        "pending_field": None,
    }