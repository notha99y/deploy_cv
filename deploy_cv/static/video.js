document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#input-vid").onchange = LoadFile;
});

function LoadFile(e) {
    let placeholderImg = document.getElementById("placeholder-img");
    if (typeof placeholderImg != "undefined" && placeholderImg != null) {
        placeholderImg.remove();
    }
    const videoDisplay = document.querySelector("#display-vid");
    const displayFlexBox = document.getElementById("display-content");

    document.querySelector('#display-vid source').setAttribute("src", URL.createObjectURL(e.target.files[0]));
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
            target_height,
        );
        videoDisplay.width = newWidth;
        videoDisplay.height = newHeight;
    });
    // videoDisplay.addEventListener("canplay", function () {
    //     canvas.style.display = "inline";
    //     ctx.drawImage(videoDisplay, 0, 0, newWidth, newHeight);
    // });
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
