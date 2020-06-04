import numpy as np
from flask import Flask, jsonify, render_template, request
from PIL import Image

from detr import *

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        input_img = request.files["input-img"]
        img = Image.open(input_img.stream)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        detected_classes, confidences, bboxes = detect(img, model, transform)
        detections_info = []
        for i, _class in enumerate(detected_classes):
            detections_info.append(
                {
                    "class": _class,
                    "confidence": confidences[i],
                    "bbox": bboxes[i],
                }
            )

        response = {
            "success": True,
            "detection_result": detections_info,
        }
    except Exception as e:
        print(e)
        print("PREDICTION ERROR")
        response = {"success": False}

    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5001")
