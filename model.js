
const { GoogleGenAI } =  require("@google/genai");

const ai = new GoogleGenAI({ apiKey: "AIzaSyBZmP2H7IxiBL2lu9Ub-BgDbFWGhImbDn8" });

async function main(ques) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: ques,
  });
  return response.text;
  // console.log(response.text);
}

module.exports=main;