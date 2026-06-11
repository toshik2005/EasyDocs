import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 16)
        self.cell(0, 10, 'EasyDocs - Viva Questions Bank', 0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.set_font('Helvetica', 'I', 10)
        self.cell(0, 10, 'Comprehensive questions for Backend, Frontend, and AI Pipeline', 0, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_pdf():
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    questions_part1 = [
        "1. Why did you choose Next.js 14 over a standard React SPA for the frontend?",
        "2. What role does Zustand play in your frontend state management compared to Redux or Context API?",
        "3. How did you implement Server-Sent Events (SSE) for real-time job status updates in Next.js?",
        "4. Can you explain why FastAPI was selected over Django or Flask for the backend?",
        "5. How is the asynchronous document processing pipeline managed using Celery and Redis?",
        "6. Explain the role of Redis in your architecture. Is it only a message broker for Celery?",
        "7. What is the advantage of using Motor (async driver) for MongoDB in a FastAPI application?",
        "8. How does your backend handle MIME-type validation to prevent malicious file uploads?",
        "9. Explain the implementation of the Circuit Breaker pattern in your multi-LLM failover logic.",
        "10. How does the backend prevent path traversal attacks when saving uploaded files?",
        "11. Can you explain how you prevent duplicate file processing using SHA-256 hashes?",
        "12. Why did you choose MongoDB over a relational database like PostgreSQL for this project?",
        "13. How does the frontend handle streaming chat responses from the LLM?",
        "14. Explain the authentication flow using JWT in your system. How do you handle token expiration?",
        "15. What is the exponential backoff strategy, and how is it implemented in your retry logic?",
        "16. How did you optimize the frontend performance and responsiveness using Tailwind CSS?",
        "17. In the context of Celery, what happens if a worker node crashes mid-processing?",
        "18. How does the backend route incoming API requests to the appropriate background task?",
        "19. What specific security measures are in place to prevent prompt injection attacks?",
        "20. Can you detail the database schema used for the Chunks and Chat History collections?",
        "21. How do you map FAISS vector IDs back to MongoDB document chunks?",
        "22. How does the system handle concurrent users uploading large files simultaneously?",
        "23. Why use separate FAISS indexes for different embedding providers (Gemini, OpenAI, HuggingFace)?",
        "24. How did you handle CORS (Cross-Origin Resource Sharing) between Next.js and FastAPI?",
        "25. What was the most challenging backend integration, and how did you resolve it?"
    ]
    
    questions_part2 = [
        "26. What exactly is Retrieval-Augmented Generation (RAG) and why is it crucial for EasyDocs?",
        "27. How does the Smart Chunking Algorithm balance token limits while preserving contextual meaning?",
        "28. Explain the significance of the 100-token overlap in your chunking strategy.",
        "29. Why do you L2-normalize vectors before performing a Cosine Similarity search in FAISS?",
        "30. What is an Inner Product (IndexFlatIP) search in FAISS, and how does it relate to cosine similarity?",
        "31. How does the OCR fallback mechanism automatically detect if a PDF requires Tesseract?",
        "32. What limitations does Tesseract OCR have, and how does scan quality affect your pipeline?",
        "33. Describe the Hierarchical Map-Reduce approach used for document summarization.",
        "34. Why do you use different LLMs (Groq LLaMA-3, OpenRouter, Ollama) instead of just one?",
        "35. How do you ensure the LLM strictly uses the retrieved chunks and does not hallucinate?",
        "36. Explain the process of creating a vector embedding from a text chunk. What does the vector represent?",
        "37. How is the conversation history maintained and passed to the LLM during a chat session?",
        "38. What happens in the RAG pipeline if the FAISS similarity score of all retrieved chunks is below 0.6?",
        "39. Can you walk me through the exact prompt structure passed to the LLM during a query?",
        "40. How does the system extract and track page numbers to provide accurate source citations?",
        "41. What is the difference between PyMuPDF (fitz) and python-docx in the parsing stage?",
        "42. How does the text cleaning pipeline handle non-printable characters and unicode normalization?",
        "43. Why is handling large documents (e.g., 100+ pages) problematic for LLMs, and how does EasyDocs solve this?",
        "44. Explain the difference between primary, first failover, and offline fallback LLM strategies.",
        "45. In performance testing, you achieved 1.8 seconds chat latency. What optimizations made this possible?",
        "46. How does your system differentiate between generating a TL;DR summary versus an Executive Summary?",
        "47. What are the specific memory limitations of FAISS, and how would you scale it for millions of documents?",
        "48. What challenges did you face when embedding and retrieving tabular data from DOCX files?",
        "49. How do you plan to implement multi-document chat in the future based on your current architecture?",
        "50. What is the single biggest limitation of EasyDocs in its current state, and how would you address it?"
    ]
    
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, 'Section 1: Frontend & Backend Technologies (25 Questions)', 0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    pdf.set_font('Helvetica', '', 11)
    for q in questions_part1:
        pdf.multi_cell(w=190, h=8, txt=q)
        
    pdf.ln(10)
    
    pdf.set_font('Helvetica', 'B', 14)
    pdf.cell(0, 10, 'Section 2: Overall Working, Concepts & AI Pipeline (25 Questions)', 0, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)
    
    pdf.set_font('Helvetica', '', 11)
    for q in questions_part2:
        pdf.multi_cell(w=190, h=8, txt=q)
        
    pdf.output('EasyDocs_Viva_Questions.pdf')

if __name__ == '__main__':
    create_pdf()
