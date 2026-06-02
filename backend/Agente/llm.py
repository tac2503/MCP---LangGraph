from langchain.messages import SystemMessage
from backend.mcp_server.model import get_model


def detect_intent(state:dict):
    model = get_model()
    response = model.invoke(
        state["messages"]
    )