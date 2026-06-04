from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from backend.mcp_server.model import get_model
from backend.Pinecone.pinecone import search_memory
tools_by_name={}

def detect_tool(state):
    if state.get("pending_field"):
        return {}

    model = get_model()
    
    user_message = state["messages"][-1].content
    
    
    response = model.invoke([
        HumanMessage(content=f"""
                    Selecciona la tool correcta.
                    Tools disponibles:
                    {list(tools_by_name.keys())}
                    
                    Mensaje del usuario:
                    {user_message}
                    
                    Responed SOLO con el nombre de la tool.
                    Si no aplica ninguna, responde: ninguna
                    
                    Si el mensaje de consultar no especifica si es por cedula o por email, será buscar por cedula.
                    Si el usuario pregunta algo relacionado con conversaciones aneriores
                    (ejemplo: "que usuarios he consultado","cual era su email",etc)
                    entonces la tool será : ninguna
                    """)
    ])
    
    tool_name = response.content.strip()
    
    return{
        "selected_tool":tool_name,
        "tool_args":{},
        "missing_fields":[],
        "pending_field":None
    }

def validate(state):
    
    tool = tools_by_name[state["selected_tool"]]
    schema = tool.args_schema
    required = schema.get("required", [])
    args =state.get("tool_args",{})
    
    missing = [f for f in required if f not in args]
    
    if not missing:
        return {
            "missing_fields":[],
            "pending_field":None
        }
    
    field = missing[0]
    description = schema["properties"][field].get(
        "description",
        field
    )
    
    return {
        "missing_fields":missing,
        "pending_field":field,
        "messages":[
            AIMessage(
                content=f"Puedes Proporcionar: {description}"
            )
        ]
    }

def update_args(state):
    field = state.get("pending_field")
    
    if not field:
        return {}
    
    value = state["messages"][-1].content
    
    args = state.get("tool_args",{})
    args[field]=value
    
    return {
        "tool_args":args,
        "pending_field":None
    }

def chat_natural(state):
    model = get_model()
    memory = state.get("messages",[])
    long_memory = search_memory(state["messages"][-1].content,"test")
    long_memory = "\n".join(
        [doc.page_content for doc in long_memory]
    )
    system_prompt = SystemMessage(
        content =(f"""
                Eres un asistente con memoria de conversación y tu función principal es ayudar a crear y consultar usuarios
                por cedula o email.
                Si el usuario pregunta relacionado con tus utilidades o que puedes hacer, debes explicar claramente
                que puedes gestionar usuarios, crearlos y consultarlos por cédula o correo.
                Y si el usuario pregunta relacionado a acciones pasadas:
                
                Contexto completo:
                {memory}
                
                Regla importante:
                -Si el usuario hace consultas relacionadas con acciones hechas anteriormente,
                revisa el contexto y responde correctamente de acuerdo a eso.
                - Ahora, si el usuario hace consulas relacionadas con acciones hechas anteriormente o en otras ejecuciones(ejemplo: necesito saber todos los usuarios consultados/regisrtados en todas las sesiones), pero no hay esa información en el contexto,
                entonces vas a responder usando este contexto que abarca todo lo que has realizado hasta ahora:
                {long_memory}
                
                Nota: También puedes responder analizando los dos contextos y completando lo que creas que falte con la información del contexto largo.
                
                
                
                """
            # "Eres un agente de gestión de usuarios."
            # "Tu función es ayudar a crear usuarios y consultar usuarios"   
            # "por cedula o email."
            # "Si el usuario hace una pregunta relacionada a tus utilidades o que puedes hacer, debes explicar claramente "
            # "que puedes gestionar usuarios, crearlos y consultarlos por cédula o correo."
        )
    )
    response = model.invoke([
        system_prompt,
        state["messages"][-1]
    ])
    
    return {
        "messages":[
            AIMessage(content=response.content)
        ],
        "selected_tool":None,
        "tool_args":{},
        "missing_fields":[],
        "pending_field":None
    }
    
# def update_memory_summary(state):
#     model = get_model()
#     messages = state["messages"].content
    
#     recent_messages = messages[-10:]
    
#     response = model.invoke([
#         HumanMessage(content=f"""
#                     Eres un sistema de memoria.
#                     Resume la conversación manteniendo:
#                     -usuarios consultados
#                     -datos importantes
#                     -acciones realizadas
#                     -contexto actual
                    
#                     Conversación:
#                     {recent_messages}
                    
#                     """)
#     ])
    
#     return {
#         "memory_summary":response.content
#     }
    