const express = require('express');
const video = require('@google-cloud/video-intelligence').v1;

const app = express();
app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { gcsUri } = req.body;
  if (!gcsUri) {
    return res.status(400).send({ error: 'Missing gcsUri in request body' });
  }

  const client = new video.VideoIntelligenceServiceClient();

  try {
    const request = {
      inputUri: gcsUri,
      features: ['LABEL_DETECTION'],
    };

    const [operation] = await client.annotateVideo(request);
    const [response] = await operation.promise();

    const labels = response.annotationResults[0].segmentLabelAnnotations.map(label => ({
      description: label.entity.description,
      segments: label.segments.map(segment => ({
        startTime: (segment.segment.startTimeOffset.seconds || 0) + (segment.segment.startTimeOffset.nanos || 0) / 1e9,
        endTime: (segment.segment.endTimeOffset.seconds || 0) + (segment.segment.endTimeOffset.nanos || 0) / 1e9,
        confidence: segment.confidence,
      })),
    }));

    res.send({ labels });
  } catch (err) {
    console.error('Video API error:', err);
    res.status(500).send({ error: 'Video analysis failed', details: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
