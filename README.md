# Transcript Mail Processor

A modern web application for processing transcripts, extracting key insights, and generating professional email drafts.

## Project Structure

This project consists of two main components:

- **Backend**: A FastAPI application that processes PDF and text files, extracts insights, and generates email drafts
- **Frontend**: A React application that provides a user interface for uploading files and viewing/editing insights and emails

## Backend Features

- Upload and process PDF/TXT files
- Extract key insights from transcripts
- Generate professional email drafts
- Update insights and email drafts based on user suggestions

### Backend API Endpoints

- **POST /api/upload**: Upload a PDF or TXT file and extract text
- **GET /api/get-key-insights/{filename}**: Generate key insights from a transcript
- **POST /api/update-key-insights/{filename}**: Update insights based on user suggestions
- **GET /api/get-mail-draft/{filename}**: Generate a professional email draft
- **POST /api/update-mail-draft/{filename}**: Update email draft based on user suggestions

## Frontend Features

- Modern, responsive UI built with React and Tailwind CSS
- File upload with drag-and-drop
- View and edit key insights
- View and edit email drafts
- Light/dark theme support

## Setup and Running the Application

### Prerequisites

- Python 3.9+ (for backend)
- Node.js 16+ (for frontend)
- npm or yarn (for frontend)

### Backend Setup

1. Navigate to the Backend directory
   ```
   cd Backend
   ```

2. Create a virtual environment and activate it
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Run the application
   ```
   python run.py
   ```

The backend API will be available at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

### Frontend Setup

1. Navigate to the Frontend directory
   ```
   cd Frontend
   ```

2. Install dependencies
   ```
   npm install
   # or with yarn
   yarn install
   ```

3. Run the development server
   ```
   npm run dev
   # or with yarn
   yarn dev
   ```

The frontend will be available at `http://localhost:5173`.

## Usage Flow

1. Open the frontend application in your browser
2. Upload a transcript file (PDF or TXT)
3. Wait for processing to complete
4. Navigate to the Insights page to view and edit key insights
5. Navigate to the Email Draft page to view and edit the generated email
6. Make any necessary adjustments to the insights or email

## Integrated Development

For the best development experience, run both the backend and frontend simultaneously in separate terminals:

Terminal 1 (Backend):
```
cd Backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

Terminal 2 (Frontend):
```
cd Frontend
npm run dev  # Or yarn dev
```

## Production Deployment

For production deployment, additional configuration is recommended:

1. Update the CORS settings in `Backend/app/core/config.py` to specify allowed origins
2. Update the API_BASE_URL in `Frontend/src/lib/api.ts` to point to your production backend URL
3. Build the frontend for production:
   ```
   cd Frontend
   npm run build  # Or yarn build
   ```
4. Serve the backend using a production ASGI server like Uvicorn with Gunicorn
