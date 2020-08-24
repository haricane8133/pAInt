// Program works only on a unix based shell that supports "&&" for chaining commands together
// For the program to run, you need conda env called "paint" set up with all the required python stuff installed. Refer to the conda env based files that are there inside the ml/ folder
// You also need to have GPU instance attached with pytorch. (Does not run in non NVIDIA GPU systems...)

// NOTE: Remove CORS in production

import fs from "fs";
import express from "express";
// import cors from "cors";
import multer from "multer";
import path from "path";
import {exec} from "child_process";
import process from "process";
import rimraf from "rimraf";
import md5 from "md5";
import AdmZip from "adm-zip";
import shuffle from "shuffle-array";

import { GalleryLast } from "./ml/parent/gallery/index";
import * as consts from "./consts";

const upload_input_rgb = multer({
    dest: "./ml/parent/inputs_rgb/",
    limits: {
        fileSize: consts.fileSizeLimit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png") {
            return cb(null, true);
        } else {
            return cb(new Error('Only .png format allowed!'));
        }
    }
});

const upload_gallery = multer({
    dest: "./ml/parent/gallery/",
    limits: {
        fileSize: consts.fileSizeLimit
    }
});

const upload_custom_art = multer({
    dest: "./ml/parent/styles/",
    limits: {
        fileSize: consts.fileSizeLimit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png") {
            return cb(null, true);
        } else {
            return cb(new Error('Only .png format allowed!'));
        }
    }
});

const port = process.env.PORT || 3000;

const app = express();
app.use(express.static('wwwroot'));
// app.use(cors());

/**
 * *** API HELLO WORLD ***
 */
app.get('/api/',
    (req, res) => {
        res.status(200).send("You have requested the API");
    }
);

/**
 * This is called by the /gallery page with a query argument 'page'
 * This returns a list of images all zipped up, from the ./ml/parent/gallery folder
 * If the page is 1, it returns images 1 - 24, and so on
 */
app.get('/api/gallery',
    (req, res) => {
        const galleryLast = require("./ml/parent/gallery/last.json") as GalleryLast;

        let imageOrder = [] as number[];
        for(let i=1;i<=galleryLast.lastNo;i++){
            imageOrder.push(i);
        }
        imageOrder = shuffle(imageOrder);

        var zip = new AdmZip();
        for(let i=0;i<consts.numImagesPerPage && i<galleryLast.lastNo;i++){
            zip.addLocalFile(`./ml/parent/gallery/${imageOrder[i].toString()}.png`);
        }
        res.setHeader("Content-Type", "application/zip");
        res.status(200).send(zip.toBuffer());
    }
);

/**
 * This is to post an image to gallery
 */
app.post("/api/gallery", upload_gallery.single("file"),
    (req, res) => {
        let img_id = req.query.id.toString();
        const galleryLast = require("./ml/parent/gallery/last.json") as GalleryLast;
        const lastNo = (++galleryLast.lastNo).toString();
        fs.copyFileSync(`./ml/parent/inputs_rgb/${img_id}.png`, `./ml/parent/gallery/${lastNo}_rgb.png`)
        fs.renameSync(`./ml/parent/gallery/${req.file.filename}`, `./ml/parent/gallery/${lastNo}.png`);
        fs.writeFileSync("./ml/parent/gallery/last.json", JSON.stringify(galleryLast));
        res.status(200).send("Image added to Gallery!");
    }
);

/**
 * This is called to get the base RGB image that the use can use to comtinue a diagram already drawn
 * Note that unlike the rest of the routes, this returns an image directly, instead of a zip containing the image
 */
app.get("/api/editgallery", (req, res) => {
    let img_name = req.query.name.toString();
    img_name = img_name.substring(0, img_name.length-4);
    const img_path = "./ml/parent/gallery/" + img_name + "_rgb.png";
    if(fs.existsSync(img_path)){
        res.sendFile(img_path, { root: __dirname})
        return;
    }
    res.status(400).send("Image not found!");
});

/**
 * *** IMAGE UPLOAD ***
 * This is called by the paint/index.html page
 * Fetches the RGB sketch from the client and stores it in ./ml/parent/inputs_rgb
 * Runs the rgb2dark convertor and stores the dark image in ./ml/parent/inputs_dark
 * The name of the file is there in the initial name that paint application gives for the image as the local name
 * As of now, the file name alone is given as "id" as request params in all subsequent requests. The plan is to replace it with cookies
 */
app.post('/api/image', upload_input_rgb.single("file"),
    (req, res) => {
        if(fs.existsSync(`./ml/parent/inputs_rgb/${req.file.originalname}.png`)){
            fs.unlinkSync(`./ml/parent/inputs_rgb/${req.file.originalname}.png`);
        }
        fs.renameSync(`./ml/parent/inputs_rgb/${req.file.filename}`, `./ml/parent/inputs_rgb/${req.file.originalname}.png`);
        if(fs.existsSync(`./ml/parent/inputs_dark/${req.file.originalname}.png`)){
            fs.unlinkSync(`./ml/parent/inputs_dark/${req.file.originalname}.png`);
        }
        // Remove the outputs folder corresponding to the old image
        rimraf(`./ml/parent/outputs/${req.file.originalname}`, () => {
            exec(`cd ./ml/color2label/ && python rgb2dark.py --input_path "../parent/inputs_rgb/${req.file.originalname}.png" --output_path "../parent/inputs_dark/${req.file.originalname}.png"`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    res.status(500).send(`error: ${error.message}`);
                    return;
                }
                if(stdout){
                    console.log(`stdout: ${stdout}`);
                }
                res.status(200).send(req.file.originalname);
            });
        });
    }
);

/**
 * *** IMAGE SYNTH and VARIATIONS ***
 * This api is hit by the /variations (Vue) page as soon as the Vue object is rendered
 * This would run ./ml/image_synthesis/test.py and ./ml/style_branch/variation_gen/test.py
 * This would return the zipped file containing all the variations of the synthesized image
 */
app.get('/api/variations',
    (req, res) => {
        let img_id = req.query.id;
        let page: number = undefined;
        try{
            page = Number.parseInt(req.query.page.toString());
        }
        catch(err){
            res.status(400).send("Wrong page");
            return;
        }
        if(page < 1 || page == undefined){
            res.status(400).send("Wrong page");
            return;
        }
        if(img_id === undefined || !fs.existsSync(`./ml/parent/inputs_dark/${img_id}.png`)){
            res.status(400).send(`No such image`);
            return;
        }
        // If we already have this, we just return!
        if(fs.existsSync(`./ml/parent/outputs/${img_id}/synthesized.png`)){
            // Writing all to a zip and returning the zip
            var zip = new AdmZip();
            for(let i = (page-1)*consts.numImagesPerPage+1;i<=page*consts.numImagesPerPage;i++){
                if(!fs.existsSync(`./ml/parent/outputs/${img_id}/variations/${i}.png`)){
                    break;
                }
                zip.addLocalFile(`./ml/parent/outputs/${img_id}/variations/${i}.png`);
            }
            res.setHeader("Content-Type", "application/zip");
            res.status(200).send(zip.toBuffer());
            return;
        }

        exec(`cd ./ml/image_synthesis/ && python test.py --name ./ade20k_pretrained/ --dataset_mode ade20k --dataroot "../parent/inputs_dark/${img_id}.png" --results_dir "../parent/outputs/${img_id}/"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                res.status(500).send(`error: ${error.message}`);
                return;
            }
            if(stdout){
                console.log(`stdout: ${stdout}`);
            }
            exec(`cd ./ml/style_branch/variation_gen/ && python test.py --name night2day_pretrained --no_flip --n_samples ${consts.numVariationsPerRun} --A_path "../../parent/outputs/${img_id}/synthesized.png" --results_dir "../../parent/outputs/${img_id}/variations/"`, (error2, stdout2, stderr2) => {
                if (error2) {
                    console.log(`error: ${error2.message}`);
                    res.status(500).send(`error: ${error2.message}`);
                    return;
                }
                if(stdout2){
                    console.log(`stdout: ${stdout2}`);
                }
                // Writing all to a zip and returning the zip
                var zip = new AdmZip();
                for(let i = (page-1)*consts.numImagesPerPage+1;i<=page*consts.numImagesPerPage;i++){
                    if(!fs.existsSync(`./ml/parent/outputs/${img_id}/variations/${i}.png`)){
                        break;
                    }
                    zip.addLocalFile(`./ml/parent/outputs/${img_id}/variations/${i}.png`);
                }
                res.setHeader("Content-Type", "application/zip");
                res.status(200).send(zip.toBuffer());
            });
        });
    }
);

/**
 * *** AUTOMATIC ARTISTIC TOUCH ***
 * This api is hit by the /artistic (Vue) page as soon as the Vue object is rendered
 * This takes the image ID (folder) and theh selected variation, to apply the artistic touch
 * This would run ./ml/style_branch/style_gen/test.py
 * This would return the zipped file containing all the variations of the artisized image
 */
app.get('/api/artistic',
    (req, res) => {
        let img_id = req.query.id;
        let img_sel = req.query.sel;
        if(img_id === undefined || img_sel === undefined || !fs.existsSync(`./ml/parent/outputs/${img_id}/variations/${img_sel}.png`)){
            res.status(400).send(`No such image`);
            return;
        }
        // If we already have this, we just return!
        if(fs.existsSync(`./ml/parent/outputs/${req.query.id}/artistic/${img_sel}/1.png`)){
            // Writing all to a zip and returning the zip
            var zip = new AdmZip();
            for(let i=1;i<consts.numArtisticPerImage+1;i++){
                zip.addLocalFile(`./ml/parent/outputs/${req.query.id}/artistic/${img_sel}/${i}.png`);
            }
            res.setHeader("Content-Type", "application/zip");
            res.status(200).send(zip.toBuffer());
            return;
        }

        exec(`cd ./ml/style_branch/style_gen/ && python test.py  --model test --no_dropout --A_path "../../parent/outputs/${img_id}/variations/${img_sel}.png" --results_dir "../../parent/outputs/${img_id}/artistic/${img_sel}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                res.status(500).send(`error: ${error.message}`);
                return;
            }
            if(stdout){
                console.log(`stdout: ${stdout}`);
            }
            
            // Writing all to a zip and returning the zip
            var zip = new AdmZip();
            for(let i=1;i<consts.numArtisticPerImage+1;i++){
                zip.addLocalFile(`./ml/parent/outputs/${req.query.id}/artistic/${img_sel}/${i}.png`);
            }
            res.setHeader("Content-Type", "application/zip");
            res.status(200).send(zip.toBuffer());
        });
    }
);

/**
 * *** CUSTOM ARTISTIC TOUCH ***
 * This api is hit by the /artistic (Vue) page as soon as the Vue object is rendered
 * This takes the image ID (folder) and theh selected variation, to apply the artistic touch
 * This also take an image as an input. We style the selected image using this input image
 * This would run ./ml/style_branch/custom_style/test.py
 * This would return the zipped file containing all the variations of the artisized image
 */
app.post('/api/artistic', upload_custom_art.single("file"),
    (req, res) => {
        let img_id = req.query.id;
        let img_sel = req.query.sel;
        let oldStyleNameNoExt = req.file.filename;
        let newStyleNameNoExt = md5(img_id.toString() + img_sel.toString() + req.file.originalname);

        if(fs.existsSync(`./ml/parent/styles/${newStyleNameNoExt}.png`)){
            fs.unlinkSync(`./ml/parent/styles/${newStyleNameNoExt}.png`);
        }
        fs.renameSync(`./ml/parent/styles/${oldStyleNameNoExt}`, `./ml/parent/styles/${newStyleNameNoExt}.png`);
        
        if(img_id === undefined || img_sel === undefined ||  !fs.existsSync(`./ml/parent/outputs/${img_id}/variations/${img_sel}.png`)){
            res.status(400).send(`No such image`);
            fs.unlinkSync(`./ml/parent/styles/${newStyleNameNoExt}.png`);
            return;
        }

        // If we already have this, we just return!
        if(fs.existsSync(`./ml/parent/outputs/${img_id}/artistic/${img_sel}/${newStyleNameNoExt}.png`)){
            // Writing the image to a zip and returning, so that we get the image name as well
            var zip = new AdmZip();
            zip.addLocalFile(`./ml/parent/outputs/${img_id}/artistic/${img_sel}/${newStyleNameNoExt}.png`);
            res.setHeader("Content-Type", "application/zip");
            res.status(200).send(zip.toBuffer());
            return;
        }

        exec(`cd ./ml/style_branch/custom_style/ && python test.py --content "../../parent/outputs/${img_id}/variations/${img_sel}.png" --style "../../parent/styles/${newStyleNameNoExt}.png" --results_dir "../../parent/outputs/${img_id}/artistic/${img_sel}"`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                res.status(500).send(`error: ${error.message}`);
                return;
            }
            if(stdout){
                console.log(`stdout: ${stdout}`);
            }
            // Writing the image to a zip and returning, so that we get the image name as well
            var zip = new AdmZip();
            zip.addLocalFile(`./ml/parent/outputs/${img_id}/artistic/${img_sel}/${newStyleNameNoExt}.png`);
            res.setHeader("Content-Type", "application/zip");
            res.status(200).send(zip.toBuffer());
        });
    }
);

// Handle 404
app.use(function(req, res, next){
    res.sendFile(path.join(__dirname, './wwwroot', 'index.html'));
});

app.listen(port, () => console.log("Server running at http://localhost:%d", port));
