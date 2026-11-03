"""
FitMaster AI – Machine Learning & Deep Learning Training Pipeline
Trains:
  1. Stage 2 Scikit-Learn Random Forest Classifier (Baseline) + Scaler + LabelEncoder
  2. Stage 3 TensorFlow/Keras Deep Multi-Layer Perceptron (Neural Network)
Enforces train/test split (80/20) and no data leakage.
Uses isolated process stages to prevent OpenMP runtime deadlocks on macOS.
"""

import os
import sys
import json
import subprocess

SAVED_MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../saved_models"))
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../datasets/processed/ml_training_data.csv"))
os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

FEATURE_COLS = [
    'age', 'gender_encoded', 'height_cm', 'weight_kg', 'bmi',
    'activity_factor', 'goal_offset', 'target_calories',
    'consumed_cal_ratio', 'consumed_protein_ratio',
    'consumed_carbs_ratio', 'consumed_fat_ratio', 'remaining_protein'
]

def run_stage_rf():
    """Stage 2: Train Scikit-Learn Random Forest Classifier & serialize preprocessing transformers."""
    import joblib
    import pandas as pd
    import numpy as np
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import accuracy_score, f1_score

    print("==========================================================")
    print("   FitMaster AI – Stage 2: Scikit-Learn Baseline Model    ")
    print("==========================================================")

    df = pd.read_csv(DATASET_PATH)
    print(f"[Data]: Loaded {len(df)} samples from {DATASET_PATH}")

    X = df[FEATURE_COLS].values
    y_raw = df['gap_label'].values

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y_raw)
    num_classes = len(label_encoder.classes_)
    print(f"[Target Classes]: {label_encoder.classes_} ({num_classes} classes)")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=1
    )
    rf_model.fit(X_train_scaled, y_train)

    rf_train_preds = rf_model.predict(X_train_scaled)
    rf_test_preds = rf_model.predict(X_test_scaled)

    rf_train_acc = accuracy_score(y_train, rf_train_preds)
    rf_test_acc = accuracy_score(y_test, rf_test_preds)
    rf_test_f1 = f1_score(y_test, rf_test_preds, average='weighted')

    print(f"  • Random Forest Train Accuracy: {rf_train_acc * 100:.2f}%")
    print(f"  • Random Forest Test Accuracy : {rf_test_acc * 100:.2f}%")
    print(f"  • Random Forest Test F1-Score : {rf_test_f1:.4f}")

    scaler_file = os.path.join(SAVED_MODELS_DIR, "scaler.pkl")
    encoder_file = os.path.join(SAVED_MODELS_DIR, "gap_encoder.pkl")
    rf_file = os.path.join(SAVED_MODELS_DIR, "rf_nutrition_classifier.pkl")
    split_data_file = os.path.join(SAVED_MODELS_DIR, "scaled_split_data.npz")

    joblib.dump(scaler, scaler_file)
    joblib.dump(label_encoder, encoder_file)
    joblib.dump(rf_model, rf_file)

    # Save scaled numpy arrays so DNN gets exact same stratified split
    np.savez_compressed(
        split_data_file,
        X_train_scaled=X_train_scaled,
        X_test_scaled=X_test_scaled,
        y_train=y_train,
        y_test=y_test,
        num_classes=num_classes
    )

    metrics = {
        'rf_metrics': {
            'train_accuracy': float(rf_train_acc),
            'test_accuracy': float(rf_test_acc),
            'f1_score': float(rf_test_f1)
        },
        'classes': list(label_encoder.classes_),
        'feature_names': FEATURE_COLS
    }
    with open(os.path.join(SAVED_MODELS_DIR, "rf_metrics.json"), 'w') as f:
        json.dump(metrics, f, indent=2)

    print("✓ Stage 2 Scikit-Learn Model & Preprocessors Saved.")


def run_stage_dnn():
    """Stage 3: Train TensorFlow/Keras Deep Multi-Layer Perceptron (Neural Network)."""
    import numpy as np
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers

    print("\n==========================================================")
    print("   FitMaster AI – Stage 3: TensorFlow / Keras Deep MLP   ")
    print("==========================================================")

    split_data_file = os.path.join(SAVED_MODELS_DIR, "scaled_split_data.npz")
    data = np.load(split_data_file)
    X_train_scaled = data['X_train_scaled'].astype(np.float32)
    X_test_scaled = data['X_test_scaled'].astype(np.float32)
    y_train = data['y_train']
    y_test = data['y_test']
    num_classes = int(data['num_classes'])

    y_train_cat = keras.utils.to_categorical(y_train, num_classes=num_classes).astype(np.float32)
    y_test_cat = keras.utils.to_categorical(y_test, num_classes=num_classes).astype(np.float32)

    dnn_model = keras.Sequential([
        layers.Input(shape=(len(FEATURE_COLS),)),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(32, activation='relu'),
        layers.Dense(num_classes, activation='softmax')
    ], name="FitMaster_NutritionGap_DNN")

    dnn_model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    dnn_model.summary()

    history = dnn_model.fit(
        X_train_scaled,
        y_train_cat,
        validation_data=(X_test_scaled, y_test_cat),
        epochs=10,
        batch_size=32,
        verbose=0
    )

    test_eval = dnn_model.evaluate(X_test_scaled, y_test_cat, verbose=0)
    dnn_test_loss = test_eval[0]
    dnn_test_acc = test_eval[1]

    dnn_preds_prob = dnn_model.predict(X_test_scaled, verbose=0)
    dnn_preds = np.argmax(dnn_preds_prob, axis=1)

    # Compute F1 via direct numpy matrix
    confusion = np.zeros((num_classes, num_classes), dtype=int)
    for t, p in zip(y_test, dnn_preds):
        confusion[t, p] += 1
    
    tp = np.diag(confusion)
    fp = np.sum(confusion, axis=0) - tp
    fn = np.sum(confusion, axis=1) - tp
    f1s = 2 * tp / np.maximum(1, 2 * tp + fp + fn)
    dnn_test_f1 = float(np.mean(f1s))

    print(f"\n  • Deep Neural Network Test Loss    : {dnn_test_loss:.4f}")
    print(f"  • Deep Neural Network Test Accuracy: {dnn_test_acc * 100:.2f}%")
    print(f"  • Deep Neural Network Macro F1     : {dnn_test_f1:.4f}")

    dnn_file = os.path.join(SAVED_MODELS_DIR, "keras_nutrition_model.keras")
    dnn_model.save(dnn_file)

    # Merge history
    rf_metrics_file = os.path.join(SAVED_MODELS_DIR, "rf_metrics.json")
    with open(rf_metrics_file, 'r') as f:
        full_history = json.load(f)

    full_history['loss'] = [float(x) for x in history.history['loss']]
    full_history['val_loss'] = [float(x) for x in history.history['val_loss']]
    full_history['accuracy'] = [float(x) for x in history.history['accuracy']]
    full_history['val_accuracy'] = [float(x) for x in history.history['val_accuracy']]
    full_history['dnn_metrics'] = {
        'test_loss': float(dnn_test_loss),
        'test_accuracy': float(dnn_test_acc),
        'f1_score': float(dnn_test_f1)
    }

    history_file = os.path.join(SAVED_MODELS_DIR, "training_history.json")
    with open(history_file, 'w') as f:
        json.dump(full_history, f, indent=2)

    # Cleanup temporary split file
    if os.path.exists(split_data_file):
        os.remove(split_data_file)
    if os.path.exists(rf_metrics_file):
        os.remove(rf_metrics_file)

    print("\n==========================================================")
    print("✓ Model Training & Serialization Complete!")
    print(f"  Saved DNN Keras: {dnn_file}")
    print(f"  Saved History  : {history_file}")
    print("==========================================================")


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--stage-rf":
        run_stage_rf()
        return
    elif len(sys.argv) > 1 and sys.argv[1] == "--stage-dnn":
        run_stage_dnn()
        return

    # Master pipeline runner invoking isolated stages
    print("Starting Multi-Stage ML/DL Pipeline...")
    res_rf = subprocess.run([sys.executable, __file__, "--stage-rf"])
    if res_rf.returncode != 0:
        print("[Error]: Stage 2 Random Forest failed.")
        sys.exit(res_rf.returncode)

    res_dnn = subprocess.run([sys.executable, __file__, "--stage-dnn"])
    if res_dnn.returncode != 0:
        print("[Error]: Stage 3 Deep Neural Network failed.")
        sys.exit(res_dnn.returncode)

    print("\n✓ Entire ML / DL Training Pipeline Finished Successfully!")

if __name__ == "__main__":
    main()
