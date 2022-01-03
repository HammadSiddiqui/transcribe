var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
const multer  = require('multer')
var app = express();
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

const speech = require('@google-cloud/speech');


app.get('/', function (req,res){
    res.sendFile(path.join(__dirname, '/public/index.html'));
})


/**
 * @desc upload a file to the server so that you can later <display> it.
 * @param  {obj} file
 * @param {string} type
 * @return bool - success or failure
 */



// const upload = multer({
//     dest: './audio',
//     //fileFilter,
// });
//
// app.post('/upload', upload.single('file'));


app.route('/upload')
    .post(function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/audio/' + filename.filename);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + filename.filename);
                res.send('File uploaded');           //where to go next
            });
        });
    });


// Creates a client
const client = new speech.SpeechClient();

async function transcribe() {
    // The path to the remote LINEAR16 file
    const gcsUri = 'gs://cloud-samples-data/speech/brooklyn_bridge.raw';

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        uri: gcsUri,
    };
    const config = {
        encoding: 'MP3',
        sampleRateHertz: 22050,
        languageCode: 'en-US',
    };
    const request = {
        audio: audio,
        config: config,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    console.log(`Transcription: ${transcription}`);
}

var server = app.listen(3030, function() {
    console.log('Listening on port %d', server.address().port);
});