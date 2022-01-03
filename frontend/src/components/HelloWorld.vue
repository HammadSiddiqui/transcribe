<template>
  <div>
  <uploader :file-status-text="fileStatusText" :options="options" class="uploader-example">
    <uploader-unsupport></uploader-unsupport>
    <uploader-drop>
      <p>Drop Audio file here to upload or</p>
      <uploader-btn>select file</uploader-btn>
<!--      <uploader-btn :attrs="attrs">select images</uploader-btn>-->
<!--      <uploader-btn :directory="true">select folder</uploader-btn>-->
    </uploader-drop>
    <uploader-list></uploader-list>
  </uploader>
    <h3>Transcription: </h3>
    <p class="transciptionbox">{{transcription}}</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      options: {
        // https://github.com/simple-uploader/Uploader/tree/develop/samples/Node.js
        target: '//localhost:3030/upload',
        testChunks: false,
      },
      attrs: {
        accept: 'audio/mp3'
      },
      transcription: "Transcription will appear here..",



    }
  },
  methods : {
    setTranscription: function(transcription) {
      this.transcription = transcription
    },
    fileStatusText(status, response) {
      const statusTextMap = {
        uploading: 'uploading',
        paused: 'paused',
        waiting: 'waiting'
      }
      if (status === 'success' || status === 'error') {
        // only use response when status is success or error

        // eg:
        // return response data ?
        this.setTranscription(response)
        //this.transcription = response
        return response.data
      } else {
        return statusTextMap[status]
      }
    },
  }

}
</script>

<style>

.uploader-example, .transciptionbox {
  width: 880px;
  padding: 15px;
  margin: 40px auto 0;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, .4);
}
.uploader-example .uploader-btn {
  margin-right: 4px;
}
.uploader-example .uploader-list {
  max-height: 440px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>