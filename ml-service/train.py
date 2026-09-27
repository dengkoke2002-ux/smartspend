"""
Trains a simple text classifier that guesses a transaction's category
from its description (e.g. "Swiggy order dinner" -> "Food").

Run this whenever you want to retrain, e.g. after adding more rows
to data/transactions_train.csv:
    python train.py
"""
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

df = pd.read_csv("data/transactions_train.csv")
X = df["description"]
y = df["category"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(lowercase=True, ngram_range=(1, 2))),
    ("clf", MultinomialNB()),
])

model.fit(X_train, y_train)

print("Evaluation on held-out test rows:")
print(classification_report(y_test, model.predict(X_test)))

# Retrain on ALL the data before saving, so the final model uses every example
model.fit(X, y)
joblib.dump(model, "category_model.joblib")
print("\nSaved trained model to category_model.joblib")
