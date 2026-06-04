# main.py

from fastapi import APIRouter
from pydantic import BaseModel

from langchain_core.messages import HumanMessage
from backend.Agente.graph import build_graph
from backend.Pinecone.pinecone import save_message

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)

graph = None


class ChatRequest(BaseModel):
    session_id:str
    message: str



@router.post("")
async def chat(request: ChatRequest):
    global graph

    if graph is None:
        graph = await build_graph()
    config = {
        "configurable":{
            "thread_id":request.session_id
        }
    }

    result = await graph.ainvoke({
        "messages": [
            HumanMessage(content=request.message)
        ]
    },config=config)
    last_message = result["messages"][-1]
    response=(
        last_message.content
        if hasattr(last_message, "content") else str(last_message)
    )
    try:
        save_message(
            session_id="test",
            user=request.message,
            bot=response
        )
    except Exception as e:
        print(f"Error saving message: {e}")
    return {
        "response": response
    }