require('dotenv').config();
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

app.route('/transcribe').get( async function(req, res) {
    let transcription = await transcribe('innocent.mp3')
    console.log(transcription)
    res.send(transcription)
});

app.route('/upload')
    .post( function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/audio/' + filename.filename);
            file.pipe(fstream);
            fstream.on('close', async function () {
                console.log("Upload Finished of " + filename.filename);
                //rename the file to unique identifier mp3 file
                let uniqueFileName = (Math.random() + 1).toString(36).substring(7) + '.mp3'
                fs.rename('./audio/' + filename.filename, './audio/'+uniqueFileName, function(err) {
                    if ( err ) console.log('ERROR: ' + err);
                });
                let uploadToGCP = await uploadFile(uniqueFileName)
                //uploadToGCP = "uploaded"
                if(uploadToGCP == "uploaded") {
                    let transcription = await transcribe(uniqueFileName)
                    console.log(transcription)
                    res.send(transcription)
                }  else {
                    res.send("transcription failed")
                }
               // res.send("ok")
            });
        });
    });


//UPLOAD TO GCP
// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');
// Creates a client
const storage = new Storage();

let bucketName = 'gcp-transcibe-audios'

async function uploadFile(filename) {
    try{
        await storage.bucket(bucketName).upload('./audio/'+filename, {
            destination: filename,
        });
        console.log(`${filename} uploaded to ${bucketName}`);
        return "uploaded"
    } catch (e) {
        console.log(e)
    }

}



// Creates a client
const client = new speech.SpeechClient();

async function transcribe(filename) {
    // The path to the remote LINEAR16 file
    try {
        const gcsUri =  'gs://gcp-transcibe-audios/'+filename; //'gs://gcp-transcibe-audios/qmixr.mp3'

        // The audio file's encoding, sample rate in hertz, and BCP-47 language code
        const audio = {
            uri: gcsUri,
        };
        const config = {
            keyFile: './service-account-file.json',
            projectId: 'idenfo-direct-production',
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
        const transcription = response.results.map(result => result.alternatives[0].transcript)
            .join('\n');
        console.log(`Transcription: ${transcription}`);
        return transcription
    } catch (e) {
        console.log(e)
    }
}

var server = app.listen(3030, function() {
    console.log('Listening on port %d', server.address().port);
});