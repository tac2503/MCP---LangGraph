from backend.Pinecone.pinecone import save_message
from langgraph.graph import StateGraph, END
from backend.Agente.state import MessagesState
from langgraph.checkpoint.memory import MemorySaver
import asyncio
from langchain_core.messages import HumanMessage
from backend.Agente.nodes import(
    tools_by_name,
    detect_tool,
    validate,
    update_args,
    chat_natural
)
from backend.Agente.tool import tool_node
from backend.mcp_server.model2 import get_tools_client

memory = MemorySaver()
def should_call_tool(state):
    return len(state.get("missing_fields",[])) == 0

def route(state):
    
    if state.get("selected_tool") in [None,"","ninguna"]:
        return "chat"
    return "validate"

async def build_graph():
    
    global tools_by_name
    tools_by_name.clear()
    tools_by_name.update(await get_tools_client())
    
    builder = StateGraph(MessagesState)
    
    builder.add_node("detect_tool", detect_tool)
    builder.add_node("validate", validate)
    builder.add_node("update_args", update_args)
    builder.add_node("tool", tool_node)
    builder.add_node("chat", chat_natural)

    builder.set_entry_point("detect_tool")

    builder.add_edge("detect_tool", "update_args")

    builder.add_conditional_edges(
        "update_args",
        route,
        {
            "chat": "chat",
            "validate": "validate"
        }
    )

    builder.add_conditional_edges(
        "validate",
        should_call_tool,
        {
            True: "tool",
            False: END
        }
    )

    builder.add_edge("tool", END)
    builder.add_edge("chat", END)

    return builder.compile(checkpointer=memory)
# async def main():

#     graph = await build_graph()

#     state = {
#         "messages": [],
#         "selected_tool": None,
#         "tool_args": {},
#         "missing_fields": [],
#         "pending_field": None
#     }
    
#     config={
#         "configurable":{
#             "thread_id":"test"
#         }
#     }

#     print("\n Chat iniciado (escribe 'exit' para salir)\n")

#     while True:

#         print("Usuario: ", end="", flush=True)
#         user_input = await asyncio.to_thread(input)

#         if user_input.lower() in ["exit", "quit"]:
#             break

        
#         state["messages"].append(
#             HumanMessage(content=user_input)
#         )

#         state = await graph.ainvoke(state,config=config)

        
#         last_msg = state["messages"][-1]
#         bot_output = last_msg.content if hasattr(last_msg, "content") else str(last_msg)
#         if hasattr(last_msg, "content"):
#             print("\nBot:", last_msg.content)
#         else:
#             print("\nBot:", last_msg)
            
#         save_message(
#             session_id="test",
#             user=user_input,
#             bot=bot_output
#         )


# # -----------------------------
# # ENTRY POINT
# # -----------------------------
# if __name__ == "__main__":
#     asyncio.run(main())