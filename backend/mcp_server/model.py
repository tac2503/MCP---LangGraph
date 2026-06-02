from langchain_google_genai import ChatGoogleGenerativeAI
from backend.mcp_server.tools import tools
import os
from dotenv import load_dotenv
load_dotenv()

def get_model():
    model =ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    model_with_tools=model.bind_tools(tools)
    return model_with_tools