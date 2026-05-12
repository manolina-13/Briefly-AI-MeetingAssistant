from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv
import tempfile
import datetime
import os
import time
import json

load_dotenv()

app = FastAPI()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(
            attempts=3,
            initial_delay=2.0,
            http_status_codes=[503, 429] 
        )
    )
)

if api_key:
    print("Using Gemini API key from", "GEMINI_API_KEY" if os.getenv("GEMINI_API_KEY") else "GOOGLE_API_KEY")
else:
    print("Warning: no Gemini API key found in environment")

@app.post("/process-audio")
async def process_audio(file: UploadFile = File(...), language: str = Form(...)):
    temp_path = None
    uploaded_file = None
    
    try:
        print(f"\n--- NEW REQUEST ---")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        print("Uploading to Google Gemini Storage...")
        uploaded_file = client.files.upload(file=temp_path)
        
        if uploaded_file and uploaded_file.name:
            while uploaded_file.state and uploaded_file.state.name == "PROCESSING":
                time.sleep(2)
                uploaded_file = client.files.get(name=uploaded_file.name)

        now = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        prompt = f"""
        Analyze this audio. Today's date and time is {now}. 
        Return a JSON object in {language} with exactly six keys:
        - 'summary': a 3-5 sentence paragraph written in {language}.
        - 'action_items': an array of strings written in {language}. Each action item must be localized to the selected language (English, Bengali, or Hindi) and should not stay in another language.
        - 'decisions': an array of strings written in {language}.
        - 'mermaid_diagram': a Mermaid.js flowchart string representing any system architecture, workflow, or process discussed. Use proper mermaid syntax (graph TD). Diagram node labels, edge text, and all mermaid text must always be in English, even when the rest of the output is in Bengali or Hindi. If no process/architecture is discussed, return an empty string.
        - 'calendar_events': an array of objects for any deadlines or meetings mentioned. Each object should have 'title' (string), 'start_time_iso' (ISO 8601 string, guess based on today if relative), 'end_time_iso' (ISO 8601 string, guess based on start_time), and 'description' (string). If none, return an empty array.
        - 'transcript': the full word-for-word transcript of the audio. Keep this in the original spoken language and do not translate it.
        Use proper local script when applicable: English for English, বাংলা for Bengali, and हिन्दी for Hindi.
        """
        
        config = types.GenerateContentConfig(response_mime_type="application/json")
        response_text = None

        # LAYER 2: Primary model attempt
        try:
            print("Attempt 1: Analyzing with Primary Model (gemini-3.1-flash-lite-preview)...")
            response = client.models.generate_content(
                model="gemini-3.1-flash-lite-preview",
                contents=[uploaded_file, prompt],
                config=config
            )
            response_text = response.text
            print("Success: Generated using Primary Model.")

        except Exception as primary_error:
            print(f"Primary Model Failed: {primary_error}")
            print("Attempt 2: Falling back to Backup Model (gemini-2.5-flash)...")

            fallback_response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[uploaded_file, prompt],
                config=config
            )
            response_text = fallback_response.text
            print("Success: Generated using Backup Model.")

        print("AI Processing Complete!")
        return {"status": "success", "data": json.loads(response_text or "{}")}

    except Exception as e:
        print(f"FATAL Server Error: {e}")
        return {"status": "error", "message": "The AI is currently overloaded. Please try again in 1 minute."}

    finally:
        if uploaded_file and uploaded_file.name:
            try: client.files.delete(name=uploaded_file.name)
            except: pass
        if temp_path and os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass

@app.post("/chat")
async def chat(transcript: str = Body(...), question: str = Body(...)):
    try:
        prompt = f"""
        Based ONLY on this transcript:
        "{transcript}"
        
        Answer this question: "{question}"
        
        Keep the answer concise and professional.
        """
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt
        )
        return {"status": "success", "answer": response.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/chat-global")
async def chat_global(history: list = Body(...), question: str = Body(...)):
    try:
        context = ""
        for idx, item in enumerate(history):
            context += f"Meeting {idx+1} (Date: {item.get('date', 'Unknown')}):\n{item.get('transcript', '')}\n\n"
        
        prompt = f"""
        Based on the transcripts of ALL past meetings provided below:
        {context}
        
        Answer this question: "{question}"
        Keep the answer concise, professional, and cite the meeting dates if relevant.
        """
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt
        )
        return {"status": "success", "answer": response.text}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/generate-ticket")
async def generate_ticket(action_item: str = Body(...), transcript: str = Body(...), language: str = Body("English")):
    try:
        prompt = f"""
        Based on the following meeting transcript, generate a professional Jira ticket for this action item: "{action_item}"
        Write the ticket in {language}.
        
        Transcript:
        "{transcript}"
        
        Return a JSON object with exactly three keys:
        - 'title': A concise, professional title for the Jira ticket in {language}.
        - 'description': A detailed description providing context from the meeting in {language}.
        - 'acceptance_criteria': An array of strings representing the acceptance criteria in {language}.
        """
        config = types.GenerateContentConfig(response_mime_type="application/json")
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=prompt,
            config=config
        )
        return {"status": "success", "ticket": json.loads(response.text or "{}")}
    except Exception as e:
        return {"status": "error", "message": str(e)}