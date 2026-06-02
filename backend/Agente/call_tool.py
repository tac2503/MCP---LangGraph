from langchain_core.messages import HumanMessage
from backend.mcp_server.model import get_model

model = get_model()

def call_llm(state):

    intent = state["intent"]

    if intent == "registrar_usuario":

        prompt = f"""
        Registra un usuario utilizando la herramienta disponible.

        nombre: {state['nombre']}
        cedula: {state['cedula']}
        email: {state['email']}
        celular: {state['celular']}
        """

    elif intent == "obtener_usuario_cedula":

        prompt = f"""
        Consulta el usuario usando la herramienta disponible.

        cedula: {state['cedula']}
        """

    elif intent == "obtener_usuario_email":

        prompt = f"""
        Consulta el usuario usando la herramienta disponible.

        email: {state['email']}
        """

    response = model.invoke(
        [HumanMessage(content=prompt)]
    )
    # natural_response = model.invoke([
    #     HumanMessage(
    #         content=f"""
    #         Responde de manera natural a este mensaje:
    #         {response.content}
    #         """
    #     )
    # ])
    
    return {
        "messages": [response]
    }