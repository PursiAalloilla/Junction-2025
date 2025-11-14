from flask import Flask, Response, stream_with_context
from flask_cors import CORS
import json
import time
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/hello')
def home():
    return {"hello": "Hi world"}

@app.route('/health')
def health():
    return {"status": "ok", "message": "Backend is running!"}

# Simulated ML Algorithm - replace this with your actual ML model
def ml_algorithm_generator():
    """
    Generator that yields ML algorithm results.
    Replace this with your actual ML model predictions.
    """
    iteration = 0
    while True:
        iteration += 1
        
        # Simulate ML algorithm output
        prediction = random.uniform(0, 100)
        confidence = random.uniform(0.7, 0.99)
        accuracy = random.uniform(0.85, 0.98)
        
        # Simulate different statuses
        statuses = ['processing', 'analyzing', 'predicting', 'optimizing']
        status = random.choice(statuses)
        
        data = {
            'iteration': iteration,
            'timestamp': datetime.now().isoformat(),
            'prediction': round(prediction, 2),
            'confidence': round(confidence, 4),
            'accuracy': round(accuracy, 4),
            'status': status,
            'processing_time_ms': random.randint(50, 300)
        }
        
        yield data
        time.sleep(1)  # Update every second

@app.route('/stream')
def stream():
    """
    Server-Sent Events endpoint for real-time ML algorithm data
    """
    def generate():
        for data in ml_algorithm_generator():
            # SSE format: "data: {json}\n\n"
            yield f"data: {json.dumps(data)}\n\n"
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no'
        }
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)