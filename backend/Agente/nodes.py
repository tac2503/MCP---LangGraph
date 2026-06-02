from langchain_core.messages import AIMessage, HumanMessage
from backend.mcp_server.model import get_model
from backend.Agente.chat_natural import chat_natural

def detect_intent(state):
    if state.get("pending_field"):
        return {}

    model = get_model()
    
    
    user_message = state["messages"][-1].content
    
    response = model.invoke([
            HumanMessage(
                content=f"""
                    Clasifica la intención del usuario.
                    Opciones válidas:
                    -registrar_usuario
                    -obtener_usuario_cedula
                    -obtener_usuario_email
                    
                    Si consideras que la intención del usuario no corresponde a ninguna de las opciones,
                    clasifica la intención como "ninguna" y responde únicamente con esa palabra.
                    
                    Responde únicamente con una de esas opciones. Sin explicaciones extra.
                    
                    Mensaje del usuario:
                    {user_message}
                        """
            )
    ])
    intent = response.content.strip()
    if intent == "ninguna":
        return chat_natural(user_message)
    return {
        "intent": intent,
        "pending_field": None,
        "nombre": None,
        "cedula": None,
        "email": None,
        "celular": None
    }
    

def collect_missing_data(state):
    
    intent= state.get("intent")
    
    if intent == "registrar_usuario":
        if not state.get("nombre"):
            return {
                "pending_field": "nombre",
                "messages":[
                    AIMessage(content="¿Cuál es el nombre del usuario?")
                ]
            }
        if not state.get("cedula"):
            return {
                "pending_field": "cedula",
                "messages":[
                    AIMessage(content="¿Cuál es la cédula del usuario?")
                ]
            }
        if not state.get("email"):
            return {
                "pending_field": "email",
                "messages":[
                    AIMessage(content="¿Cuál es el email del usuario?")
                ]
            }
        if not state.get("celular"):
            return {
                "pending_field": "celular",
                "messages":[
                    AIMessage(content="¿Cuál es el celular del usuario?")
                ]
            }
    if intent == "obtener_usuario_cedula":
        if not state.get("cedula"):
            return {
                "pending_field": "cedula",
                "messages":[
                    AIMessage(content="¿Cuál es la cédula del usuario que deseas consultar?")
                ]
            }
    if intent == "obtener_usuario_email":
        if not state.get("email"):
            return {
                "pending_field": "email",
                "messages":[
                    AIMessage(content="¿Cuál es el email del usuario que deseas consultar?")
                ]
            }
    return {}

def shoul_call_tool(state):
    intent = state.get("intent")
    
    if intent == "registrar_usuario":
        return all([
            state.get("nombre"),
            state.get("cedula"),
            state.get("email"),
            state.get("celular")
        ])
    if intent == "obtener_usuario_cedula":
        return state.get("cedula") is not None
    if intent == "obtener_usuario_email":
        return state.get("email") is not None
    return False
def update_user_data(state):
    """
    Guarda la última respuesta del usuario
    en el campo que esté pendiente.
    """

    pending_field = state.get("pending_field")

    if len(state["messages"]) == 0 or not pending_field:
        return {}

    last_message = state["messages"][-1].content

    if pending_field == "nombre":
        return {"nombre": last_message, "pending_field": None}

    if pending_field == "cedula":
        return {"cedula": last_message, "pending_field": None}

    if pending_field == "email":
        return {"email": last_message, "pending_field": None}

    if pending_field == "celular":
        return {"celular": last_message, "pending_field": None}

    return {"pending_field": None}