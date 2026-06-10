from langchain.messages import AnyMessage
from typing_extensions import TypedDict, Annotated 
import operator

class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    
    selected_tool : str | None
    tool_args: dict | None
    missing_fields: list[str] | None
    pending_field: str | None
    last_filled_field:str | None
    validated_fields: list[str] | None  
        