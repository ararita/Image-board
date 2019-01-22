const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./db");

app.use(bodyParser.json());

app.use(express.static("./public"));

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

//----route------

//uploader above has .single, to make sure that it's file;
//puts the file in the uploads dir and changes name of file to be some unique 24 character string
app.post("/upload", uploader.single("file"), (req, res) => {
    console.log("POST /upload");
    console.log("req body: ", req.body);
    console.log("req file: ", req.file);
});

//next steps: take the file name, title, decription name and in the images tabele
//make new image render automatically on the screen (without reloading the page)

app.get("/images", (req, res) => {
    db.getImages().then(dbResult => {
        res.json(dbResult.rows);
    });
});

app.listen(8080, () => {
    console.log("listening!");
});
