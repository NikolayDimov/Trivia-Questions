import {
  BlobWriter,
  HttpReader,
  TextReader,
  ZipWriter,
} from "https://unpkg.com/@zip.js/zip.js/index.js";

onmessage = async (e) => {
  const {
    currentCorrectScore,
    selectAmount,
    wrongAnswers,
    selectedCategory,
    selectDifficulty,
  } = e.data;

  const resultPercentage = Math.round(
    (currentCorrectScore / selectAmount) * 100
  );
  const text = `You answered ${currentCorrectScore} questions correctly of total ${selectAmount} and ${wrongAnswers} questions incorrectly. 
  Your result is ${resultPercentage}%
  You choose category of "${selectedCategory}" with difficulty "${selectDifficulty}"`;
  const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
  await zipWriter.add("QuizScore.txt", new TextReader(text));
  const blob = await zipWriter.close();
  postMessage(blob);
};
