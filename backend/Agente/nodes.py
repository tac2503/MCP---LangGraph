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
                    Eres un clasificador de intención para seleccionar herramientas.

                    TOOLS DISPONIBLES:
                    {list(tools_by_name.keys())}

                    MENSAJE DEL USUARIO:
                    {user_message}

                    INSTRUCCIONES:

                    Analiza la intención REAL del usuario, no solo palabras clave.
                    Solo selecciona una tool cuando el usuario esté solicitando explícitamente una acción que corresponda a una de las tools disponibles.
                    Si el usuario está haciendo una pregunta general, conversando, pidiendo información, definiendo conceptos, preguntando por personas famosas, lugares, empresas, eventos o cualquier tema de conocimiento general, responde:
                    ninguna

                    Ejemplos:

                    "¿Quién es Messi?" → ninguna
                    "¿Qué es Python?" → ninguna
                    "¿Cuándo nació Shakira?" → ninguna
                    "Explícame qué es una API" → ninguna
                    Si existe una tool para consultar usuarios, SOLO debe utilizarse cuando el usuario claramente quiera buscar información de un usuario en el sistema.

                    Ejemplos:

                    "Consulta el usuario 12345678" → obtener_usuario_cedula
                    "Busca el usuario con cédula 12345678" → obtener_usuario_cedula
                    "Dame la información del usuario 12345678" → obtener_usuario_cedula

                    NO usar obtener_usuario_cedula ni otra tool para:

                    "¿Quién es Messi?"
                    "¿Quién es Juan Pérez?"
                    "Háblame de Elon Musk"
                    "¿Quién fue Simón Bolívar?"
                    Si el mensaje de consulta no especifica si es por cédula o email, asumir búsqueda por cédula.
                    Si el usuario pregunta por consultas previas, resultados anteriores o contexto histórico de la conversación, responder:
                    ninguna

                    Ejemplos:

                    "¿Qué usuarios consulté?"
                    "¿Cuál era su email?"
                    "¿Qué me mostraste antes?"
                    "¿Qué resultado obtuvimos?"
                    Si el mensaje no corresponde claramente a ninguna tool disponible, responder:
                    ninguna
                    La respuesta debe contener ÚNICAMENTE:
                    El nombre exacto de una tool, o
                    ninguna

                    NO agregues explicaciones, puntuación, comentarios ni texto adicional.
                    """)
    ])
    content = response.content
    if isinstance(content, str):
        tool_name=content.strip()
    elif isinstance(content,list):
        tool_name="".join(
            part.get("text","") if isinstance(part,dict) else str(part)
            for part in content
        ).strip()
    else:
        tool_name=str(content).strip()
        
    args={}
    if tool_name !="ninguna":
        tool = tools_by_name[tool_name]
        schema = tool.args_schema
        extract = model.invoke([
            HumanMessage(
                content=f"""
                    Extrae los parámetros del mensaje.
                    
                    Mensaje:
                    {user_message}
                    Schema:
                    {schema}
                    Responde SOLO un diccionario python.
                    
                    Ejemplos:
                    
                    mensaje:
                    consulta usuario con cedula 12345.
                    respuesta:
                    {{"cedula":"12345"}}
                    mensaje:
                    consulta usuario con email test@test.com
                    respuesta:
                    {{"email":"test@test.com"}}
                    mensaje:
                    quiero crear registro de Maicol con cedula 00003
                    respuesta:
                    {{"nombre":"Maicol", "cedula":"00003"}}
                """
            )
        ]).content
        if isinstance(extract, str):
            extract=extract.strip()
        elif isinstance(extract,list):
            extract="".join(
                part.get("text","") if isinstance(part,dict) else str(part)
                for part in extract
            ).strip()
        else:
            extract=str(extract).strip()
        try: 
            args=eval(extract)
        except:
            args={}
    
    return{
        "selected_tool":tool_name,
        "tool_args":args,
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
        "pending_field":None,
        "last_filled_field":field
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
                Eres un asistente especializado EXCLUSIVAMENTE en la gestión de usuarios.

                Tus únicas funciones son:

                1. Crear usuarios.
                2. Consultar usuarios por cédula.
                3. Consultar usuarios por email.
                4. Responder preguntas sobre consultas o acciones previas realizadas dentro de esta conversación utilizando el contexto disponible.

                Contexto reciente:
                {memory}

                Contexto histórico:
                {long_memory}

                REGLAS DE COMPORTAMIENTO

                1. NO eres un asistente de propósito general.

                2. NO debes responder preguntas de cultura general, historia, deportes, tecnología, ciencia, geografía, entretenimiento, política ni ningún tema ajeno a la gestión de usuarios.

                3. Si el usuario pregunta algo fuera de tus funciones, NO intentes responder parcialmente ni proporcionar información relacionada.

                Ejemplos de preguntas fuera de alcance:

                * ¿Quién es Messi?
                * ¿Qué es Python?
                * ¿Cuál es la capital de Francia?
                * ¿Quién ganó el mundial?
                * Explícame inteligencia artificial

                Para cualquier pregunta fuera de alcance debes responder EXACTAMENTE:

                "No fui creado para responder ese tipo de consultas. Mis funciones son:

                * Crear usuarios.
                * Consultar usuarios por cédula.
                * Consultar usuarios por email.
                * Informar sobre consultas realizadas previamente dentro de esta conversación."

                4. Si el usuario pregunta qué puedes hacer, responde explicando únicamente las funciones anteriores.

                5. Si el usuario hace referencia a acciones pasadas, consultas previas o usuarios consultados anteriormente, utiliza primero:
                {memory}

                Y complementa la respuesta con:
                {long_memory}

                6. Nunca inventes información que no exista en los contextos.

                7. Si la solicitud es ambigua y no está claramente relacionada con la gestión de usuarios, considérala fuera de alcance y utiliza el mensaje de rechazo definido anteriormente.

                IMPORTANTE:
                Antes de responder, verifica:

                * ¿La solicitud trata sobre crear usuarios?
                * ¿La solicitud trata sobre consultar usuarios?
                * ¿La solicitud trata sobre consultas previas de usuarios?

                Si la respuesta es NO para las tres preguntas, utiliza el mensaje de rechazo.
                
                """
            
        )
    )
    response = model.invoke([
        system_prompt,
        state["messages"][-1]
    ]).content
    if isinstance(response, str):
        response=response.strip()
    elif isinstance(response,list):
        response="".join(
            part.get("text","") if isinstance(part,dict) else str(part)
            for part in response
        ).strip()
    else:
        response=str(response).strip()
    return {
        "messages":[
            AIMessage(content=response)
        ],
        "selected_tool":None,
        "tool_args":{},
        "missing_fields":[],
        "pending_field":None
    }
    

def validate_field(state):
    field = state.get("last_filled_field")
    value= state.get("tool_args",{}).get(field,"")
    model = get_model()
    if field == "nombre":
        resultado = model.invoke([
            HumanMessage(
                content=f"Es '{value}' un nombre real y coherente para una persona? Responde solo 'válido' o 'inválido'"
            )
        ]).content
        if isinstance(resultado, str):
            es_valido=resultado.strip().lower()
        elif isinstance(resultado,list):
            es_valido="".join(
                part.get("text","") if isinstance(part,dict) else str(part)
                for part in resultado
            ).strip().lower()
        else:
            es_valido=str(resultado).strip().lower()
    elif field == "cedula": 
        resultado = model.invoke([
            HumanMessage(
                content=f"Es {value} una cédula posible para una persona? Ten en cuenta que las cédulas en Colombia son números. Response solo 'válido' o 'inválido'."
            )
        ]).content
        if isinstance(resultado, str):
            es_valido=resultado.strip().lower()
        elif isinstance(resultado,list):
            es_valido="".join(
                part.get("text","") if isinstance(part,dict) else str(part)
                for part in resultado
            ).strip().lower()
        else:
            es_valido=str(resultado).strip().lower()
    elif field == "email": 
        resultado = model.invoke([
            HumanMessage(
                content=f"Es {value} un email posible para una persona? Response solo 'válido' o 'inválido'."
            )
        ]).content
        if isinstance(resultado, str):
            es_valido=resultado.strip().lower()
        elif isinstance(resultado,list):
            es_valido="".join(
                part.get("text","") if isinstance(part,dict) else str(part)
                for part in resultado
            ).strip().lower()
        else:
            es_valido=str(resultado).strip().lower()
    elif field == "celular": 
        resultado = model.invoke([
            HumanMessage(
                content=f"Es {value} un celular posible para una persona? Response solo 'válido' o 'inválido'."
            )
        ]).content
        if isinstance(resultado, str):
            es_valido=resultado.strip().lower()
        elif isinstance(resultado,list):
            es_valido="".join(
                part.get("text","") if isinstance(part,dict) else str(part)
                for part in resultado
            ).strip().lower()
        else:
            es_valido=str(resultado).strip().lower()
    else: 
        es_valido=True
    
    if es_valido == 'inválido':
        args = state.get("tool_args",{})
        args.pop(field,None)
        return {
            "tool_args":args,
            "pending_field":field,
            "missing_fields":[field],
            "messages": [AIMessage(content=f"'{value}'no es un {field} válido. Porfavor ingresa un {field} válido.")]
        }
        
    return {}