# main.py

from fastapi import FastAPI
from pydantic import BaseModel

from langchain_core.messages import HumanMessage
from backend.Agente.graph import build_graph

app = FastAPI()

graph = build_graph()


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat(request: ChatRequest):

    result = graph.invoke({
        "messages": [
            HumanMessage(content=request.message)
        ]
    })

    return result