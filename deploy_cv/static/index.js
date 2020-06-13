document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#input-img").onchange = LoadFile;
    document.querySelector("#submit-btn").onclick = GetPrediction;
});
function LoadFile(e) {
    let placeholderImg = document.getElementById("placeholder-img");
    if (typeof placeholderImg != "undefined" && placeholderImg != null) {
        placeholderImg.remove();
    }
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        let image = new Image();
        image.src = event.target.result;
        image.onload = (e) => {
            let canvas = document.getElementById("my-canvas");
            const displayFlexBox = document.getElementById("display-content");
            canvas.width = displayFlexBox.offsetWidth;
            canvas.height = canvas.width / (image.width / image.height);

            [newWidth, newHeight] = GetResizeDimension(
                image.width,
                image.height,
                canvas.width,
                canvas.height
            );
            console.log(newWidth, newHeight);
            let ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, newWidth, newHeight);
        };
    };
}

function GetResizeDimension(
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight
) {
    let aspectRatio = sourceWidth / sourceHeight;
    let newWidth = targetWidth;
    let newHeight = newWidth / aspectRatio;
    if (newHeight > targetHeight) {
        newHeight = targetHeight;
        newWidth = newHeight * aspectRatio;
    }
    return [parseInt(newWidth), parseInt(newHeight)];
}

function GetPrediction() {
    console.log("I have clicked");
    const request = new XMLHttpRequest();
    const form = $("form")[0];
    const sendData = new FormData(form);
    request.open("POST", "/image/predict");
    request.send(sendData);
    request.onload = () => {
        const receivedData = JSON.parse(request.responseText);

        if (receivedData.success) {
            console.log(receivedData);
            const canvas = document.getElementById("my-canvas");
            const ctx = canvas.getContext("2d");
            for (var i = 0; i < receivedData.detection_result.length; i++) {
                var detection_info = receivedData.detection_result[i];
                // Bounding Box
                let baseColor = new Color();
                ctx.beginPath();
                ctx.lineWidth = "3";
                ctx.strokeStyle = baseColor.hsl;
                [xc, yc, w, h] = detection_info.bbox;
                const x1 = (xc - w / 2) * newWidth;
                const y1 = (yc - h / 2) * newHeight;

                w = w * newWidth;
                h = h * newHeight;

                ctx.rect(x1, y1, w, h);
                ctx.stroke();

                // Labels
                const textHeight = 16;
                ctx.font = `${textHeight}px Arial`;
                let label = `${detection_info.class}: ${(
                    detection_info.confidence * 100
                ).toFixed(2)}%`;
                const textWidth = ctx.measureText(label).width;

                ctx.fillStyle = baseColor.hsl;
                ctx.fillRect(x1, y1, textWidth, textHeight);

                ctx.strokeStyle = "#000000";
                ctx.textBaseline = "top";
                ctx.lineWidth = "1";
                ctx.strokeText(label, x1, y1);
            }
        } else {
            console.log(receivedData);
        }
    };
}
