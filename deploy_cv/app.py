import os
from pathlib import Path

import cv2
import numpy as np
from flask import (
    Flask,
    abort,
    jsonify,
    render_template,
    request,
    send_from_directory,
)
from PIL import Image
from tqdm import tqdm

from detr import *
from drawer import Drawer

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/video")
def video():
    return render_template("video.html")


@app.route("/image/predict", methods=["POST"])
def predict():
    try:
        input_img = request.files["input-img"]
        img = Image.open(input_img.stream)
        if img.mode != "RGB":
            img = img.convert("RGB")
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


@app.route("/video/predict", methods=["POST"])
def predict_video():

    try:
        input_video = request.files["input-vid"]
        dest = Path(".") / "temp"
        if dest.is_dir() and len(list(dest.glob("*"))) > 0:
            for p in dest.glob("*"):
                p.unlink()

        dest.mkdir(exist_ok=True, parents=True)
        temp_vid_file = dest / input_video.filename
        input_video.save(temp_vid_file)
        save_vid_name = dest / (temp_vid_file.stem + "_results.mp4")
        cap = cv2.VideoCapture(str(temp_vid_file))

        width = int(cap.get(3))
        height = int(cap.get(4))
        fps = int(cap.get(5))
        frame_counts = int(cap.get(7))
        print(f"Video Resolution {width} x {height}")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        # fourcc = cv2.VideoWriter_fourcc(*'MJPG')
        out_vid = cv2.VideoWriter(
            str(save_vid_name), fourcc, fps, (width, height)
        )

        for count in tqdm(range(frame_counts)):
            ret, image = cap.read()
            key = cv2.waitKey(1) & 0xFF

            image_copy = image.copy()
            img = Image.fromarray(image_copy)
            if img.mode != "RGB":
                img = img.convert("RGB")
            detected_classes, confidences, bboxes = detect(
                img, model, transform
            )

            for i, _class in enumerate(detected_classes):
                label = f"{_class}: {round(confidences[i] * 100, 2)}%"
                xc, yc, w, h = bboxes[i]
                l, t, r, b = Drawer.convert_cxcywh_to_ltrb((xc, yc, w, h))
                ltrb_rescaled = (l * width, t * height, r * width, b * height)
                Drawer.draw_bb(img, ltrb_rescaled, label)

            # cv2.imshow("detection", np.array(img))
            out_vid.write(np.array(img))

            if key == ord("q"):
                break

        out_vid.release()
        cap.release()
        cv2.destroyAllWindows()

        response = {"success": True}

        temp_vid_file.unlink()

        print("Yay it worked!")

    except Exception as e:
        print(e)
        print("VIDEO PREDICTION ERROR")
        response = {"success": False}

    return jsonify(response)


@app.route("/video/get_results", methods=["GET"])
def get_video_results():
    """Get saved video results from a GET request"""

    directory = Path(".") / "temp"
    filename = next(directory.glob("*")).name
    try:
        return send_from_directory(
            directory=directory, filename=filename, as_attachment=True
        )

    except FileNotFoundError:
        abort(404)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
