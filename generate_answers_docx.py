import os
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def create_answers_docx():
    doc = Document()
    
    # Title
    title = doc.add_heading('EasyDocs - Viva Questions & Answers', level=1)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Subtitle
    subtitle = doc.add_paragraph('Comprehensive Guide for Backend, Frontend, and AI Pipeline')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle_run = subtitle.runs[0]
    subtitle_run.italic = True
    
    doc.add_paragraph()
    
    # Function to add Q&A
    def add_qa(q, a):
        p_q = doc.add_paragraph()
        run_q = p_q.add_run(q)
        run_q.bold = True
        run_q.font.color.rgb = RGBColor(0, 51, 102) # Dark Blue
        
        p_a = doc.add_paragraph()
        run_a = p_a.add_run("Answer: ")
        run_a.bold = True
        p_a.add_run(a)
        doc.add_paragraph() # Spacing

    doc.add_heading('Section 1: Frontend & Backend Technologies (25 Questions)', level=2)
    
    qa_part1 = [
        ("1. Why did you choose Next.js 14 over a standard React SPA for the frontend?", 
         "Next.js 14 provides Server-Side Rendering (SSR) and Server Components, improving SEO and initial load times compared to standard SPAs. It also simplifies API routing and provides optimized data fetching, essential for our real-time dashboard and chat UI."),
        ("2. What role does Zustand play in your frontend state management compared to Redux or Context API?", 
         "Zustand is extremely lightweight, requires less boilerplate than Redux, and doesn't suffer from the provider-wrapping complexities of Context API. It handles our global UI states (like current document, chat history, sidebar toggles) efficiently without unnecessary re-renders."),
        ("3. How did you implement Server-Sent Events (SSE) for real-time job status updates in Next.js?", 
         "We used Next.js API routes configured to return a 'text/event-stream' content type. The frontend uses the native EventSource API to listen to these streams, which our FastAPI backend pushes updates to via Redis Pub/Sub or direct Celery status polling, ensuring real-time job progress without constant HTTP polling."),
        ("4. Can you explain why FastAPI was selected over Django or Flask for the backend?", 
         "FastAPI is built for async operations (using Starlette) and provides out-of-the-box data validation using Pydantic. It is significantly faster than Django/Flask for I/O bound tasks like file uploads and LLM API calls. Its native support for async/await perfectly matches our asynchronous pipeline."),
        ("5. How is the asynchronous document processing pipeline managed using Celery and Redis?", 
         "When a file is uploaded, the FastAPI endpoint immediately returns a job ID to the user and delegates the heavy lifting (parsing, OCR, embedding) to Celery. Celery workers pick up these tasks from the Redis message broker, execute them in the background, and update the status in MongoDB."),
        ("6. Explain the role of Redis in your architecture. Is it only a message broker for Celery?", 
         "Redis serves a dual purpose. Primarily, it acts as the message broker for Celery, routing tasks to workers. Secondly, it is used as the result backend to temporarily store task statuses before they are permanently written to MongoDB."),
        ("7. What is the advantage of using Motor (async driver) for MongoDB in a FastAPI application?", 
         "Motor enables non-blocking, asynchronous database operations. In a FastAPI application handling multiple concurrent file uploads and chat queries, using a synchronous driver (like PyMongo) would block the event loop, defeating the purpose of FastAPI's async architecture. Motor prevents this."),
        ("8. How does your backend handle MIME-type validation to prevent malicious file uploads?", 
         "We use the python-magic library to inspect the actual file signature (magic numbers) rather than trusting the file extension provided by the client. If a malicious executable is renamed to .pdf, python-magic will detect its true MIME type and the backend will reject it with a 400 error."),
        ("9. Explain the implementation of the Circuit Breaker pattern in your multi-LLM failover logic.", 
         "We maintain a failure counter for each LLM provider. If a provider fails 5 consecutive times (e.g., due to rate limits or API downtime), the circuit 'opens', and requests are instantly routed to the fallback provider for a cooldown period (60 seconds) without attempting the failing provider."),
        ("10. How does the backend prevent path traversal attacks when saving uploaded files?", 
         "We discard the original filename provided by the user for file storage. Instead, we generate a secure UUID (Universally Unique Identifier) and use that as the filename on the disk. The original filename is only stored in MongoDB for display purposes."),
        ("11. Can you explain how you prevent duplicate file processing using SHA-256 hashes?", 
         "Upon file upload, we compute the SHA-256 hash of the file's content. We query MongoDB to see if this hash already exists for the requesting user. If it does, we return the existing document ID instead of reprocessing the file, saving computational resources and LLM API costs."),
        ("12. Why did you choose MongoDB over a relational database like PostgreSQL for this project?", 
         "MongoDB's schema-less, document-oriented nature perfectly fits our unstructured data, such as variable-length text chunks, flexible chat histories, and dynamic document metadata. Relational databases require rigid schemas which are less adaptable for AI-driven text processing."),
        ("13. How does the frontend handle streaming chat responses from the LLM?", 
         "The frontend uses Next.js to handle the streaming response chunk-by-chunk. As the backend FastAPI yields tokens from the LLM, the frontend reads the stream reader (using fetch API and ReadableStream), appending the chunks to the chat state in real-time, providing a typewriter effect."),
        ("14. Explain the authentication flow using JWT in your system. How do you handle token expiration?", 
         "Upon login, the user receives an access token and a refresh token. The access token is short-lived and sent in the Authorization header. When it expires, the frontend uses the longer-lived refresh token to obtain a new access token without requiring the user to log in again."),
        ("15. What is the exponential backoff strategy, and how is it implemented in your retry logic?", 
         "Exponential backoff is a retry strategy where the wait time between failed API calls doubles (2s, 4s, 8s, 16s). It prevents our system from overwhelming a struggling LLM provider with repeated immediate requests, giving the provider time to recover from rate limits."),
        ("16. How did you optimize the frontend performance and responsiveness using Tailwind CSS?", 
         "Tailwind CSS provides utility classes that map directly to CSS properties, allowing us to build responsive designs quickly without context switching. It also purges unused CSS in production, resulting in a very small stylesheet footprint, which improves initial load performance."),
        ("17. In the context of Celery, what happens if a worker node crashes mid-processing?", 
         "If a worker node crashes, the task remains unacknowledged in Redis. Celery's visibility timeout ensures that another available worker node will eventually pick up the unacknowledged task and re-process it, ensuring no data loss."),
        ("18. How does the backend route incoming API requests to the appropriate background task?", 
         "FastAPI acts purely as the API gateway. When a processing endpoint is hit, it calls task_name.delay(args) which serializes the task and pushes it to Redis. A Celery worker listening to that Redis queue picks up the message and executes the function."),
        ("19. What specific security measures are in place to prevent prompt injection attacks?", 
         "We sanitize user queries before passing them to the LLM. Furthermore, our prompts are strictly structured using system boundaries. We isolate the context from the user's question to prevent the question from overriding system instructions."),
        ("20. Can you detail the database schema used for the Chunks and Chat History collections?", 
         "The Chunks collection stores doc_id, chunk_id, raw text, page number, and a reference embedding_id. The Chat History collection stores doc_id, user_id, and an array of messages, where each message contains the role (user/assistant), text, timestamp, and source citations."),
        ("21. How do you map FAISS vector IDs back to MongoDB document chunks?", 
         "We maintain a mapping table in MongoDB. When a vector is inserted into FAISS, it is given an integer ID. We save this FAISS ID alongside the chunk metadata in MongoDB. Upon retrieving nearest neighbors from FAISS, we use those integer IDs to query MongoDB for the actual text and page numbers."),
        ("22. How does the system handle concurrent users uploading large files simultaneously?", 
         "The system handles this seamlessly because FastAPI accepts the file asynchronously, immediately passes it to the Celery queue via Redis, and frees up the API worker. Celery workers process the files in the background based on available concurrency limits, preventing API timeouts."),
        ("23. Why use separate FAISS indexes for different embedding providers (Gemini, OpenAI, HuggingFace)?", 
         "Different embedding models output vectors of different dimensions (Gemini: 768, OpenAI: 1536, HuggingFace: 384). FAISS indexes require vectors of a fixed, uniform dimension. Therefore, we must maintain separate FAISS indexes for each provider to ensure mathematical compatibility."),
        ("24. How did you handle CORS (Cross-Origin Resource Sharing) between Next.js and FastAPI?", 
         "We configured the FastAPI CORSMiddleware to explicitly allow requests from our Next.js frontend's origin, permitting specific methods (GET, POST) and headers like Authorization and Content-Type."),
        ("25. What was the most challenging backend integration, and how did you resolve it?", 
         "The most challenging part was orchestrating the multi-LLM failover gracefully. Ensuring that streamed responses didn't break when switching providers mid-generation or handling timeouts correctly required robust async exception handling and circuit-breaker implementation.")
    ]

    for q, a in qa_part1:
        add_qa(q, a)

    doc.add_page_break()
    doc.add_heading('Section 2: Overall Working, Concepts & AI Pipeline (25 Questions)', level=2)

    qa_part2 = [
        ("26. What exactly is Retrieval-Augmented Generation (RAG) and why is it crucial for EasyDocs?", 
         "RAG stands for Retrieval-Augmented Generation. Instead of relying solely on the LLM's pre-trained knowledge, RAG retrieves relevant information from the user's uploaded document and feeds it to the LLM as context. This is crucial for EasyDocs to provide accurate, document-specific answers and prevent hallucinations."),
        ("27. How does the Smart Chunking Algorithm balance token limits while preserving contextual meaning?", 
         "The algorithm breaks text at logical boundaries like paragraphs. It merges short paragraphs to reach an optimal token count (400-600 tokens) for LLM context windows, and splits overly long paragraphs at sentence boundaries. This ensures chunks are large enough to contain context but small enough to fit within embedding limits."),
        ("28. Explain the significance of the 100-token overlap in your chunking strategy.", 
         "The 100-token overlap prevents context loss at chunk boundaries. If a critical concept or sentence spans across the end of one chunk and the beginning of another, the overlap ensures that the semantic meaning is preserved in both chunks, improving retrieval accuracy."),
        ("29. Why do you L2-normalize vectors before performing a Cosine Similarity search in FAISS?", 
         "L2-normalization scales all vectors to a length of 1. In FAISS, when vectors are L2-normalized, calculating the Inner Product (dot product) is mathematically equivalent to calculating Cosine Similarity. This allows us to use FAISS's highly optimized Inner Product search for faster similarity computations."),
        ("30. What is an Inner Product (IndexFlatIP) search in FAISS, and how does it relate to cosine similarity?", 
         "IndexFlatIP performs an exhaustive search calculating the Inner Product between the query vector and all database vectors. Because our vectors are L2-normalized, this Inner Product precisely represents the cosine of the angle between the vectors, which measures semantic similarity regardless of text length."),
        ("31. How does the OCR fallback mechanism automatically detect if a PDF requires Tesseract?", 
         "After extracting text using PyMuPDF, the system calculates the average number of characters per page. If this average falls below a specific threshold (e.g., 50 characters), it implies the PDF is made of scanned images rather than digital text, triggering the Tesseract OCR fallback."),
        ("32. What limitations does Tesseract OCR have, and how does scan quality affect your pipeline?", 
         "Tesseract struggles with low-resolution scans, handwritten text, complex multi-column layouts, and watermarks. Poor scan quality leads to garbled text extraction, which in turn degrades the quality of vector embeddings and the accuracy of the LLM's final answers."),
        ("33. Describe the Hierarchical Map-Reduce approach used for document summarization.", 
         "LLMs have context window limits. For large documents, we first map each chunk to an individual summary. Then, we reduce these summaries by combining them and summarizing the combined text. This recursive map-reduce process continues until we get a single, cohesive summary of the entire document."),
        ("34. Why do you use different LLMs (Groq LLaMA-3, OpenRouter, Ollama) instead of just one?", 
         "Relying on a single provider introduces a single point of failure (downtime, rate limits, API changes). Using Groq as primary provides high speed; OpenRouter acts as a reliable cloud fallback, and Ollama ensures the system can still function offline or during massive cloud outages."),
        ("35. How do you ensure the LLM strictly uses the retrieved chunks and does not hallucinate?", 
         "We use strict prompt engineering. The system prompt explicitly commands: 'You are an assistant. Answer the question based ONLY on the provided context. If the answer cannot be found in the context, output exactly \"Information not found in the document\"'. This constrains the model's output."),
        ("36. Explain the process of creating a vector embedding from a text chunk. What does the vector represent?", 
         "The embedding model converts the text chunk into a high-dimensional array of floating-point numbers (a vector). This vector represents the semantic meaning of the text. Texts with similar meanings are mapped to vectors that are close to each other in this high-dimensional space."),
        ("37. How is the conversation history maintained and passed to the LLM during a chat session?", 
         "The backend retrieves the last 'N' messages from the MongoDB Chat History collection. These messages are appended to the prompt in chronological order right before the current question. This provides the LLM with conversational context to resolve pronouns or follow-up queries."),
        ("38. What happens in the RAG pipeline if the FAISS similarity score of all retrieved chunks is below 0.6?", 
         "If the highest similarity score is below 0.6, it means no chunk in the document is semantically relevant to the user's question. The backend intercepts this and returns a standard response indicating information could not be found, preventing the LLM from guessing."),
        ("39. Can you walk me through the exact prompt structure passed to the LLM during a query?", 
         "The prompt structure is: 1. System instructions (strict boundaries). 2. Retrieved Context (with chunk IDs and page numbers). 3. Conversation History. 4. The user's actual question. This structured formatting helps the LLM distinguish between background data and the direct instruction."),
        ("40. How does the system extract and track page numbers to provide accurate source citations?", 
         "During the parsing stage, PyMuPDF extracts text page by page. We attach the current page number as metadata to the text before sending it to the chunker. When chunks are saved to MongoDB, this page number is preserved. Upon retrieval, we pass the page number to the LLM and the frontend for citation."),
        ("41. What is the difference between PyMuPDF (fitz) and python-docx in the parsing stage?", 
         "PyMuPDF is optimized for PDF files; it extracts text based on visual layout and page structures. python-docx is designed specifically for Microsoft Word's XML-based structure; it extracts text by iterating through paragraph and table objects within the docx archive."),
        ("42. How does the text cleaning pipeline handle non-printable characters and unicode normalization?", 
         "The pipeline uses Python's unicodedata.normalize to resolve weird unicode representations into standard ASCII/UTF-8. It also uses regex to strip out excessive newlines, invisible zero-width spaces, and control characters that confuse tokenizers."),
        ("43. Why is handling large documents (e.g., 100+ pages) problematic for LLMs, and how does EasyDocs solve this?", 
         "Passing 100+ pages verbatim exceeds the token limit (context window) of most LLMs, causing truncation or 'lost in the middle' memory issues, plus high API costs. EasyDocs solves this via RAG (retrieving only the relevant chunks) and Map-Reduce summarization (summarizing in smaller batches)."),
        ("44. Explain the difference between primary, first failover, and offline fallback LLM strategies.", 
         "Primary (Groq LLaMA-3) is the fastest and preferred choice. First failover (OpenRouter Mixtral) is used if Groq hits rate limits or is down. Offline fallback (Ollama) runs locally on the server hardware; it is the slowest but guarantees availability even if the server loses external internet access."),
        ("45. In performance testing, you achieved 1.8 seconds chat latency. What optimizations made this possible?", 
         "Several factors contributed: Groq's specialized LPU hardware provides extremely fast inference; FAISS IndexFlatIP executes in milliseconds; FastAPI is async and lightweight; and we use streaming responses, so the user sees the first word in milliseconds rather than waiting for the whole paragraph."),
        ("46. How does your system differentiate between generating a TL;DR summary versus an Executive Summary?", 
         "We use different system prompts for the final refinement stage of the Map-Reduce pipeline. A TL;DR prompt asks for a 2-3 sentence overview. An Executive Summary prompt asks for a structured breakdown of key findings, methodologies, and conclusions suitable for C-level reading."),
        ("47. What are the specific memory limitations of FAISS, and how would you scale it for millions of documents?", 
         "FAISS (IndexFlatIP) stores the entire index in RAM for fast computation. If scaled to millions of documents, RAM exhaustion becomes a bottleneck. To solve this, we would transition to an approximate nearest neighbor index like IVF-PQ or use a disk-backed vector database like Pinecone or Milvus."),
        ("48. What challenges did you face when embedding and retrieving tabular data from DOCX files?", 
         "DOCX tables are extracted cell-by-cell. Naive extraction flattens the table into a single string, losing row/column context. We convert tables into a structured format (like Markdown tables or tab-separated text) before chunking, so the LLM retains the relational meaning of the data."),
        ("49. How do you plan to implement multi-document chat in the future based on your current architecture?", 
         "Currently, FAISS search is filtered by a single doc_id. For multi-document chat, we would allow the user to select a 'workspace' of multiple documents. The FAISS query would search across all vectors belonging to those doc_ids, and the LLM prompt would include the source document name alongside the page number."),
        ("50. What is the single biggest limitation of EasyDocs in its current state, and how would you address it?", 
         "The biggest limitation is that OCR and complex layout parsing (like charts/graphs) are still imperfect. Tesseract struggles with messy scans, and visual data is lost. We would address this by integrating vision-language models (like GPT-4V or Gemini Pro Vision) capable of natively understanding images and layouts.")
    ]

    for q, a in qa_part2:
        add_qa(q, a)

    doc.save('EasyDocs_Viva_Answers.docx')

if __name__ == '__main__':
    create_answers_docx()
