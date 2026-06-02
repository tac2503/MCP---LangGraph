from langchain.messages import AnyMessage
from typing_extensions import TypedDict, Annotated 
import operator

class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    
    intent:str | None
    pending_field:str | None
    nombre:str | None
    cedula:str | None
    email:str | None
    celular:str | None