document.addEventListener('DOMContentLoaded', function() {  // it is good approach because sometime what happens is before loading html or accessing DOM by js , js file starts executing so than that html element shows as null
   

    
    const chatBox = document.getElementById('chatBox');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const newChat = document.getElementById("newChat");


    // Session ID management
    function getOrCreateSessionId() {
        try {
            // Check if sessionId exists in localStorage , if exists means user is continue chatting without new chat or page load
            let sessionId = localStorage.getItem('sessionId');
            
            if (!sessionId) {
                // Generate new session ID if none exists
                sessionId = crypto.randomUUID();
                localStorage.setItem('sessionId', sessionId);
                console.log('New sessionId created:', sessionId); // Debug
            } else {
                console.log('Existing sessionId found:', sessionId); 
            }
            
            return sessionId;
        } catch (e) {
            console.error('localStorage error:', e);
            // Fallback to in-memory session ID if localStorage fails
            return 'temp-' + generateSessionId();
        }
    }

    // Generate UUID v4
    // function generateSessionId() {
    //     return crypto.randomUUID?.() || // Modern browsers
    //         'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //             const r = Math.random() * 16 | 0;
    //             const v = c === 'x' ? r : (r & 0x3 | 0x8);
    //             return v.toString(16);
    //         });
    // }


    // Add message to chat box
    function addMessage(sender, text, isLoading = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        if (isLoading) {
            msgDiv.innerHTML = `<div class="loader"></div>`; // Add loader spinner inside message div
        } else {
            msgDiv.textContent = text;
        }
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Handle form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const question = userInput.value.trim();
        if (!question) {
            return;
        }

        // Get or create session ID
        const sessionId = getOrCreateSessionId();
        console.log('Using sessionId:', sessionId); // Debug

        // Add user message to UI
        addMessage('user', question);

        // Show loading indicator
        addMessage('bot', '', true);
        userInput.value = '';

        try {
            // Send request to backend
            const response = await fetch('http://localhost:4000/askQues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ques: question,
                    sessionId: sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.text();
            // console.log('Received response:', responseData); // Debug

            // Remove loading indicator and show response
            const loadingMsg = document.querySelector('.message.bot .loader');
            if (loadingMsg) {
                loadingMsg.remove(); // Ensure to remove spinner
            }

            //add bot reply to UI
            addMessage('bot', responseData);
        } catch (error) {
            console.error('Fetch error:', error);
            const loadingMsg = document.querySelector('.message.bot .loader');
            if (loadingMsg) {
                loadingMsg.remove(); // Ensure removal of loading spinner on error
            }
            addMessage('bot', '⚠️ Error: Could not get response from server');
        }      
    });




    // New Chat functionality: Clear sessionId from localStorage and Redis
    if (newChat) {
      newChat.addEventListener("click", async () => {
        const sessionId = localStorage.getItem("sessionId");
        
        if (sessionId) {
          localStorage.removeItem("sessionId");
          
          try {
            // Send a request to the backend to delete session data from Redis
            const response = await fetch('http://localhost:4000/deleteSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId
                })
            });
  
            if (!response.ok) {
                console.error('Error deleting session data from Redis');
            }
  
            // Optionally, reload page to reset the state
            location.reload();
          } catch (error) {
            console.error('Error deleting session data from Redis:', error);
          }
        }
      });
    }
});
