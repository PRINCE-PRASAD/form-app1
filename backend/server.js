const express = require("express");
const cors = require("cors");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});



app.post("/submit-form", async (req, res) => {
  const formData = req.body;

  const filename = `contact-form-${Date.now()}.json`;
  const jsonData = JSON.stringify(formData, null, 2);

  const uploadParams = {
    Bucket: process.env.S3_BUCKET,
    Key: `forms/${filename}`,
    Body: jsonData,
    ContentType: "application/json",
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    res.json({ message: "Form uploaded successfully", key: uploadParams.Key });
  } catch (err) {
    console.error("Error uploading to S3:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
