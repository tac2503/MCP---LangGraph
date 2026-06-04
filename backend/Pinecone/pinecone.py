import os
import uuid
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from dotenv import load_dotenv
load_dotenv()


embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    output_dimensionality=1024
)

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

vectorstore = PineconeVectorStore(
    index_name="mcp-index",
    embedding=embeddings
)


def save_message(session_id: str, user: str, bot: str):

    doc = Document(
        page_content=f"""
Usuario: {user}

Asistente: {bot}
""",
        metadata={
            "session_id": session_id,
            "id": str(uuid.uuid4())
        }
    )

    vectorstore.add_documents([doc])