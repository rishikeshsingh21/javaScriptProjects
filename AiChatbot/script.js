const messageInput = document.querySelector(".message-input");
const chatbody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWapper = document.querySelector(".file-upload-wrapper")
const fileCancleButton = document.querySelector("#file-cancle")
const chatbotTogger = document.querySelector("#chatbot-toggler")
const closeChatbot = document.querySelector("#close-chatbot")

const API_KEY = "YOUR_GEMINI_API  ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

const chatHistory =[];
const initialInputHeight = messageInput.scrollHeight;


//Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// generating bot response using API
const generateBotResponse = async (incomingMessageDiv) => {
  const messaegeElement = incomingMessageDiv.querySelector(".message-text");

  //add user message to chat history
  chatHistory.push({
    role:"user",
    parts: [
      { text: userData.message },
      ...(userData.file.data
        ? [{ inline_data: userData.file }]
        : userData.file),
    ]
  });
  // API request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory,
    }),
  };

  try {
    // fetch response

    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    //extract and display the bot response
    const apiResponseText = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    messaegeElement.innerText = apiResponseText;

    // add bot response to the chat history
    chatHistory.push({
      role:"model",
      parts: [
        { text: userData.message }
      ]
    });
  } catch (error) {
    messaegeElement.innerText = error.message;
    messaegeElement.style.color = `#ff0000`;
  } finally {
    // Reset users file date, rmoving thinking indicator and scroll chat to bottom
    userData.file ={}
    incomingMessageDiv.classList.remove("thinking");
    chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });
  }
};
//handle outgoing user messages
const handleOutgoingMessage = (e) => {
  e.preventDefault();

  userData.message = messageInput.value.trim();
  messageInput.value = "";
  fileUploadWapper.classList.remove("file-uploaded");
  messageInput.dispatchEvent(new Event("input"));
  //create and diaplay user message
  const messageContent = `
  <div class="message-text"></div>
  ${
    userData.file.data
      ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class ="attachment" />`
      : ""
  }`;

  const outgoingMessageDiv = createMessageElement(
    messageContent,
    "user-message"
  );
  outgoingMessageDiv.querySelector(".message-text").innerText =
    userData.message;
  chatbody.appendChild(outgoingMessageDiv);

  chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });

  //Simulate bot response with thinking indicator after a delay
  setTimeout(() => {
    const messageContent = `<svg
            class="bot-avatar"
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"
            ></path>
          </svg>
          <div class="message-text">
            <div class="thinking-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>`;
    const incomingMessageDiv = createMessageElement(
      messageContent,
      "bot-message",
      "thinking"
    );
    chatbody.appendChild(incomingMessageDiv);
    chatbody.scrollTo({ top: chatbody.scrollHeight, behavior: "smooth" });
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Handle Enter key press for sending messaeges
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});

//adjust the input field height dynamically 
messageInput.addEventListener("input",()=>{
  messageInput.style.height =`${initialInputHeight}px`
  messageInput.style.height =`${messageInput.scrollHeight}px`
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px":"32px";
})

// handle file input change and preview the selected file
fileInput.addEventListener("change", () => {
  console.log(fileInput);
  const file = fileInput.files[0];

  if (!file) return;
  const reader = new FileReader(); /// converting the binary file to base64
  ////Base64 is a way of encoding binary data (like images, videos, or documents) into a text format using only printable ASCII characters (letters, numbers, +, /, and = for padding).
  console.log(file);
  reader.onload = (e) => {
    fileUploadWapper.querySelector("img").src = e.target.result;
    fileUploadWapper.classList.add("file-uploaded")
    const base64String = e.target.result.split(",")[1];

    //store file data in userData
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
    fileInput.value = "";
    console.log(userData);
    // console.log(e)
    // console.log(e.target)
    console.log(userData);
  };

  reader.readAsDataURL(file);
});


//cancle file upload
fileCancleButton.addEventListener("click",()=>{
  userData.file = {};
  fileUploadWapper.classList.remove("file-uploaded")
});

//Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({ 
   theme:"dark",
   skinTonePoisition :"none",
   previewPosition:"none",
   onEmojiSelect:(emoji)=>{
    const {selectionStart: start, selectionEnd: end}= messageInput;
    messageInput.setRangeText(emoji.native,start,end,"end");
    messageInput.focus();
   },
   onClickOutside: (e) =>{
    console.log(e.target.id)
    if(e.target.id === "emoji-picker"){
      document.body.classList.toggle("show-emoji-picker");
    }else{

      document.body.classList.remove("show-emoji-picker");
    }
   }
})


document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document
  .querySelector("#file-upload")
  .addEventListener("click", () => fileInput.click());

  chatbotTogger.addEventListener('click',()=>document.body.classList.toggle("show-chatbot"));


  closeChatbot.addEventListener("click",()=>document.body.classList.remove("show-chatbot"));