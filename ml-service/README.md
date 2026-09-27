# SmartSpend ML Categorizer (Phase 3)

A small Python service that predicts a transaction's category from its
description, using a TF-IDF + Naive Bayes text classifier trained on
data/transactions_train.csv.

## Setup
```
cd ml-service
pip install -r requirements.txt
python train.py       # trains the model, prints accuracy, saves category_model.joblib
python app.py         # starts the API on http://localhost:8000
```

## Test it
```
curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d "{\"description\": \"Swiggy order dinner\"}"
```
Should return something like:
```
{"category": "Food", "confidence": 0.91}
```

## Improving accuracy
Add more labeled rows to data/transactions_train.csv (more examples per
category = better accuracy), then re-run `python train.py` to retrain.
