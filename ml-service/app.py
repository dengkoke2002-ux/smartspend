from flask import Flask, request, jsonify
import joblib
import os

app = Flask(__name__)

# Find the trained model in the same folder as app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "category_model.joblib")

model = None


def load_model():
    global model

    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            model = None
    else:
        print("Model file not found.")
        model = None


load_model()


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "app": "SmartSpend ML Service",
        "status": "running",
        "message": "SmartSpend ML service is working!"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })


@app.route("/predict", methods=["POST"])
def predict():

    if model is None:
        return jsonify({
            "error": "Model not loaded. Please check category_model.joblib."
        }), 503

    try:
        data = request.get_json(force=True)

        description = data.get("description", "").strip()

        if not description:
            return jsonify({
                "error": "description is required"
            }), 400

        category = model.predict([description])[0]

        confidence = None

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba([description])[0]
            confidence = float(max(probabilities))

        return jsonify({
            "category": str(category),
            "confidence": round(confidence, 3) if confidence is not None else None
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)