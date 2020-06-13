document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#input-vid").onchange = LoadFile;
    document.querySelector("#submit-btn").onclick = RunPrediction;
});

function LoadFile(e) {
    let placeholderImg = document.getElementById("placeholder-img");
    if (typeof placeholderImg != "undefined" && placeholderImg != null) {
        placeholderImg.remove();
    }
    const videoDisplay = document.querySelector("#display-vid");
    const displayFlexBox = document.getElementById("display-content");

    document
        .querySelector("#display-vid source")
        .setAttribute("src", URL.createObjectURL(e.target.files[0]));
    videoDisplay.load();
    
    videoDisplay.addEventListener("loadedmetadata", function () {
        console.log("Meta data loaded");
        let target_width = displayFlexBox.offsetWidth;
        let target_height =
            target_width / (videoDisplay.videoWidth / videoDisplay.videoHeight);
        [newWidth, newHeight] = GetResizeDimension(
            videoDisplay.videoWidth,
            videoDisplay.videoHeight,
            target_width,
            target_height
        );
        videoDisplay.width = newWidth;
        videoDisplay.height = newHeight;
    });
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

function RunPrediction() {
    console.log("I have clicked");
    const request = new XMLHttpRequest();
    const form = $("form")[0];
    const sendData = new FormData(form);
    request.open("POST", "/video/predict");
    request.send(sendData);
    request.onload = () => {
        const receivedData = JSON.parse(request.responseText);

        if (receivedData.success === true) {
            GetResults();
        } else {
            console.log(receivedData);
        }
    };
}

function GetResults() {
    const request = new XMLHttpRequest();
    request.open("GET", "/video/get_results");
    request.send(null);
    request.onload = () => {
        const receivedData = request.responseText;

        const videoDisplay = document.querySelector("#display-vid");
        const displayFlexBox = document.getElementById("display-content");

        document
            .querySelector("#display-vid source")
            .setAttribute("src", receivedData);
        videoDisplay.load();
        videoDisplay.addEventListener("loadedmetadata", function () {
            console.log("Meta data loaded");
            let target_width = displayFlexBox.offsetWidth;
            let target_height =
                target_width /
                (videoDisplay.videoWidth / videoDisplay.videoHeight);
            [newWidth, newHeight] = GetResizeDimension(
                videoDisplay.videoWidth,
                videoDisplay.videoHeight,
                target_width,
                target_height
            );
            videoDisplay.width = newWidth;
            videoDisplay.height = newHeight;
        });
        // console.log(receivedData)
        // console.log(request.responseText);
    };
}
