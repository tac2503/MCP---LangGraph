from langchain_core.messages import AIMessage, HumanMessage
from backend.mcp_server.model import get_model

def chat_natural(entrada):
    model = get_model()

    response = model.invoke(
        [HumanMessage(content=entrada)]
    )

    return {
        "messages": [AIMessage(content=response.content)],
        "intent": None,
        "pending_field": None,
        "nombre": None,
        "cedula": None,
        "email": None,
        "celular": None
    }