const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./db");
const config = require("./config");

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

const s3 = require("./s3");
//----route------

//uploader below has .single, to make sure that it's a file;
//puts the file in the uploads dir and changes name of file to be some unique 24 character string
app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("POST /upload");
    console.log("req body: ", req.body);
    console.log("req file: ", req.file);
    db.addImage(
        config.s3Url + req.file.filename,
        req.body.name,
        req.body.title,
        req.body.description
    ).then(({ rows }) => {
        res.json(rows[0]);
    });
});

app.get("/images", (req, res) => {
    db.getImages().then(dbResult => {
        res.json(dbResult.rows);
    });
});

app.get("/image/:id", (req, res) => {
    db.getImageData(req.params.id).then(dbResult => {
        console.log("dbResult", dbResult.rows);
        res.json(dbResult.rows);
    });
});
//from vue take the image id, pass it to the component as a prop;
//do it in both script and index.js
app.get("/image/:id/comments", (req, res) => {
    db.getImageComments(req.params.id).then(dbResult => {
        console.log("dbResult", dbResult.rows);
        res.json(dbResult.rows);
    });
});

app.post("/comment/:id/add", (req, res) => {
    console.log("req.body:", req.body);
    console.log("req.params.id:", req.params.id);

    db.addImageComment(req.body.name, req.body.text, req.params.id).then(
        dbResult => {
            console.log("results from comments: ", dbResult);
            res.json(dbResult.rows);
        }
    );
});

app.post("/more", (req, res) => {
    db.getMoreImages(req.body.lastId).then(dbResult => {
        res.json(dbResult);
    });
});

app.listen(8080, () => {
    console.log("listening!");
});
