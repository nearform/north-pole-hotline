const partA = [
  "abiding",
  "adorable",
  "heavenly",
  "rampant",
  "wandering",
  "cuddly"
];

const partB = [
  "tinsel",
  "holly",
  "mistletoe",
  "candy canes",
  "pudding",
  "icicles"
];

export default function generateChatName() {
  const a = partA[Math.floor(Math.random() * partA.length)]
  const b = partB[Math.floor(Math.random() * partB.length)]
  const postFix = Math.floor(Math.random() * 100);

  return `${a}-${b}-${postFix}`
}
