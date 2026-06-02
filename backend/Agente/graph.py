from langgraph.graph import StateGraph, END
from backend.Agente.state import MessagesState
from backend.Agente.nodes import(
    detect_intent,
    collect_missing_data,
    update_user_data,
    shoul_call_tool
)
from backend.Agente.tool import tool_node
from backend.Agente.call_tool import call_llm

def route_after_collect(state):
    if shoul_call_tool(state):
        return "llm"
    return END

def build_graph():
    
    builder = StateGraph(MessagesState)
    builder.add_node("detect_intent", detect_intent)
    builder.add_node("collect_missing_data", collect_missing_data)
    builder.add_node("update_user_data", update_user_data)
    builder.add_node("llm", call_llm)
    builder.add_node("tool", tool_node)
    
    builder.set_entry_point("detect_intent")
    
    builder.add_edge("detect_intent","update_user_data")
    builder.add_edge("update_user_data","collect_missing_data")
    
    builder.add_conditional_edges(
        "collect_missing_data",
        route_after_collect,
        {
            "llm":"llm",
            END:END
        }
    )
    builder.add_edge("llm","tool")
    builder.add_edge("tool",END)
    
    return builder.compile()

if __name__ == "__main__":
    from langchain_core.messages import HumanMessage
    graph = build_graph()
    state = {
        "messages":[]
    }
    
    while True:
        text = input("Usuario: ")
        state["messages"].append(
            HumanMessage(content=text)
        )
        state = graph.invoke(state)
        print("\nSTATE:")
        print(state)
        
        last = state["messages"][-1]
        
        if isinstance(last.content, list):
            text = "".join(
                part.get("text", "") if isinstance(part.dict) else str(part)
                for part in last.content
            )
        else:
            text = last.content
        print(
            "\nBot: ",
            text
        )
    # result = graph.invoke({
    #     "messages":[
    #         HumanMessage(content="Quiero registrar un nuevo usuario")
    #     ]
    # })
    # print(result)