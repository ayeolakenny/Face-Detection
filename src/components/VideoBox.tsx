import { FC, Fragment, createRef, useEffect } from "react";
import * as faceapi from "face-api.js";

export const VideoBox: FC = () => {
  const video = createRef<HTMLVideoElement>();

  useEffect(() => {
    Promise.all([
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.ageGenderNet.loadFromUri("/models"),
    ]).then(startVideo);

    function startVideo() {
      navigator.mediaDevices.getUserMedia({ video: {} }).then(
        (stream) => {
          video.current!.srcObject = stream;
          video.current!.play();
        },
        (err) => console.error(err)
      );
    }
  }, [video]);

  const triggerPlay = () => {
    const canvas = faceapi.createCanvasFromMedia(video.current!);
    document.body.append(canvas);
    const displaySize = {
      width: 720,
      height: 560,
    };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video.current!, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      // resizedDetections.forEach((detection) => {
      //   const box = detection.detection.box;
      //   const drawBox = new faceapi.draw.DrawBox(box, {
      //     label: Math.round(detection.age) + " year old " + detection.gender,
      //   });
      //   drawBox.draw(canvas);
      // });
    }, 100);
  };

  return (
    <Fragment>
      <video
        id="video"
        autoPlay
        muted
        onPlaying={triggerPlay}
        ref={video}
      ></video>
    </Fragment>
  );
};
