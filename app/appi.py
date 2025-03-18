from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
from datetime import datetime
import shutil
import json
from fastapi.responses import JSONResponse
from typing import Optional
from fastapi import Query


app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory for storing video-audio files
UPLOAD_DIR = "media_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_file(file: UploadFile, prefix: str):
    """ Save uploaded file with a unique name """
    file_extension = os.path.splitext(file.filename)[1] or '.webm'
    unique_filename = f"{prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return unique_filename, file_path

@app.post("/upload-video-audio")
async def upload_video_audio(video_file: UploadFile = File(...), audio_file: UploadFile = File(...)):
    """ Uploads video and audio as separate files """
    try:
        video_filename, video_path = save_file(video_file, "video")
        audio_filename, audio_path = save_file(audio_file, "audio")
        #transcribed=transcribe(audio_file)       important

        return {
            "video_filename": video_filename,
            "video_path": video_path,
            "audio_filename": audio_filename,
            "audio_path": audio_path,
            "message": "Video and audio uploaded successfully"
            #"transcription": transcribed['transcription']     important
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recordings")
async def list_recordings():
    """ List all uploaded files """
    try:
        files = os.listdir(UPLOAD_DIR)
        recordings = [
            {
                "filename": file,
                "created_at": datetime.fromtimestamp(os.path.getctime(os.path.join(UPLOAD_DIR, file))).isoformat(),
                "size_kb": round(os.path.getsize(os.path.join(UPLOAD_DIR, file)) / 1024, 2)
            }
            for file in files if os.path.isfile(os.path.join(UPLOAD_DIR, file))
        ]
        return {"recordings": recordings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/recordings/{filename}")
async def delete_recording(filename: str):
    """ Delete a specific recorded file """
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Recording not found")

    os.remove(file_path)
    return {"message": f"Recording {filename} deleted successfully"}

@app.get("/user-profile")
async def get_user_profile(
    userId: str = Query(..., description="The authenticated user's ID"),
    userName: Optional[str] = Query(None, description="The authenticated user's display name"),
    email: Optional[str] = Query(None, description="The authenticated user's email")
):
    """ Get user profile data for a specific authenticated user """
    if not userId:
        raise HTTPException(status_code=400, detail="User ID is required")

    user_name = userName or f"user_{userId[:8]}"
    user_email = email or f"user_{userId[:8]}@example.com"

    dummy_profile = {
        "id": userId,
        "username": user_name,
        "email": user_email,
        "bio": f"This is the profile for {user_name}.",
        "joinedDate": datetime.now().isoformat(),
        "stats": {
            "totalRecordingTime": "02:45:30",
            "averageSessionLength": "00:10:15",
            "lastActive": datetime.now().isoformat()
        }
    }
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)