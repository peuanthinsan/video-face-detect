const express = require('express');
const video = require('@google-cloud/video-intelligence').v1;

const app = express();
app.use(express.json());

app.post('/face-detection', async (req, res) => {
  const { gcsUri } = req.body;
  if (!gcsUri) return res.status(400).send({ error: 'Missing gcsUri in request body' });

  const client = new video.VideoIntelligenceServiceClient();

  const request = {
    inputUri: gcsUri,
    features: ['FACE_DETECTION'],
    videoContext: {
      faceDetectionConfig: {
        includeBoundingBoxes: true,
        includeAttributes: true,
      },
    },
  };

  try {
    const [operation] = await client.annotateVideo(request);
    const [response] = await operation.promise();

    const results = response;

    res.send({ faces: results });
  } catch (error) {
    console.error('Face Detection Error:', error);
    res.status(500).send({ error: 'Face detection failed', details: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Face detection server running on port ${PORT}`);
});
