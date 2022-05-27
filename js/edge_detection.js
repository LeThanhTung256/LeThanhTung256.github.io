window.onload = function () {

    var canvas1 = document.getElementById("myCanvas1");
    var context1 = canvas1.getContext("2d");

    var canvas2 = document.getElementById("myCanvas2");
    var context2 = canvas2.getContext("2d");

    var video = document.getElementById("myVideo");
    var slider = document.getElementById("intensity");
    var button = document.getElementById("myButton");

    var thresh = 250;
    
    button.onclick = function () {
        if (video.paused) {
            video.play();
            button.innerHTML = "Pause";
        }
        else {
            video.pause();
            button.innerHTML = "Play";
        }
    };

    video.oncanplay = function () {
        var vid = this;

        canvas1.width = canvas2.width = vid.videoWidth;
        canvas1.height = canvas2.height = vid.videoHeight;

        button.disabled = false;
    };

    video.onplay = function () {
        var vid = this;
        (function loop() {
            if (!vid.paused && !vid.ended) {

                context1.drawImage(vid, 0, 0);

                var image = context1.getImageData(0, 0, vid.videoWidth, vid.videoHeight);
                var edge = sobel(image, thresh);

                context2.putImageData(edge, 0, 0);

                setTimeout(loop, 1000 / 30);
            }
        })();
    };
    video.onended = function () {
        button.innerHTML = "Play";
    };
};

function sobel(imgData, thresh) {

    var row = imgData.height;
    var col = imgData.width;

    var rowStep = col * 4;
    var colStep = 4;

    var data = imgData.data;

    var newImgData = new ImageData(col, row);
    for (var i = 1; i < row - 1; i += 1)
        for (var j = 1; j < col - 1; j += 1) {

            var center = i * rowStep + j * colStep;

            var topLeft = data[center - rowStep - colStep + 1];
            var top = data[center - rowStep + 1];
            var topRight = data[center - rowStep + colStep + 1];
            var left = data[center - colStep + 1];
            var right = data[center + colStep + 1];
            var bottomLeft = data[center + rowStep - colStep + 1];
            var bottom = data[center + rowStep + 1];
            var bottomRight = data[center + rowStep + colStep + 1];

            var dx = (topRight - topLeft) + 2 * (right - left) + (bottomRight - bottomLeft);
            var dy = (bottomLeft - topLeft) + 2 * (bottom - top) + (bottomRight - topRight);
            var grad = Math.sqrt(dx * dx + dy * dy);

            if (grad >= thresh)
                newImgData.data[center] = newImgData.data[center + 1] = newImgData.data[center + 2] = 255;
            else
                newImgData.data[center] = newImgData.data[center + 1] = newImgData.data[center + 2] = 0;

            newImgData.data[center + 3] = 255;
        }

    return newImgData;
}