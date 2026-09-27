"""
A tiny web service that wraps the trained model so the Node.js backend
can call it over HTTP. Start with: python app.py
It listens on http://localhost:8000
"""
from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

MODEL_PATH = "category_model.joblib"
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        model = None

load_model()

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not trained yet. Run train.py first."}), 503

    data = request.get_json(force=True)
    description = data.get("description", "")
    if not description:
        return jsonify({"error": "description is required"}), 400

    category = model.predict([description])[0]
    # Confidence score (highest predicted probability)
    probs = model.predict_proba([description])[0]
    confidence = float(max(probs))

    return jsonify({"category": category, "confidence": round(confidence, 3)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
