// This, along with loadImage1.js, act as a mechanism of loading the RGB starting image of an image from the gallery directly upon redirect
// This file is run at the last of the index.html, and is run if loadimage1.js was able to pick up any query params that denote that we have to load an image
// This code, then makes an HTTP request and gets the desired image and loads it to the canvas
if(startBlobImg !== null && startBlobImg !== undefined){
    const xhttp = new XMLHttpRequest();
    xhttp.open(
        "GET",
        `http://23.20.38.12/api/editgallery?name=${startBlobImg}`,
        true
    );
    xhttp.responseType = "blob";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let blob = this.response;
            let startBlobURL = URL.createObjectURL(blob);

            load_image_from_URI(startBlobURL, (error, img) => {
                // revoke object URL regardless of error
                URL.revokeObjectURL(startBlobURL);
                if(error){ show_error_message("Failed to open file:", error); }

                open_from_Image(img, () => {
                    file_name = startBlobImg;
                    document_file_path = file.path; // available in Electron
                    update_title();
                    saved = true;
                }, null);
            });
        }
    };
    xhttp.send();   
}