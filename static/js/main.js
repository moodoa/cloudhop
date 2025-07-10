document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let myUserId = null;

    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const uploadButton = document.getElementById('upload-button');
    const fileInput = document.getElementById('file-input');
    const userIdSpan = document.getElementById('user-id');
    const onlineUsersCountSpan = document.getElementById('online-users-count');

    socket.on('assign_id', (data) => {
        myUserId = data.user_id;
        userIdSpan.textContent = `#${myUserId}`;
    });

    socket.on('system_message', (data) => {
        const p = document.createElement('p');
        p.className = 'system-message';
        p.textContent = data.msg;
        messagesDiv.appendChild(p);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    socket.on('chat_message', (data) => {
        displayMessage(data.user_id, data.msg);
    });

    socket.on('media_message', (data) => {
        displayMedia(data.user_id, data.url, data.type);
    });

    function displayMessage(userId, msg) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');

        const idSpan = document.createElement('div');
        idSpan.classList.add('user-id');

        if (userId === myUserId) {
            msgDiv.classList.add('my-message');
            idSpan.textContent = `You #${userId} ☁️`;
        } else {
            msgDiv.classList.add('other-message');
            idSpan.textContent = `☁️ #${userId}`;
        }
        
        const msgContent = document.createElement('div');
        msgContent.textContent = msg;

        msgDiv.appendChild(idSpan);
        msgDiv.appendChild(msgContent);
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function displayMedia(userId, url, type) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');

        const idSpan = document.createElement('div');
        idSpan.classList.add('user-id');

        if (userId === myUserId) {
            msgDiv.classList.add('my-message');
            idSpan.textContent = `You #${userId} 🍓`;
        } else {
            msgDiv.classList.add('other-message');
            idSpan.textContent = `🌸 #${userId}`;
        }

        let mediaElement;
        if (type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = url;
        } else {
            mediaElement = document.createElement('video');
            mediaElement.src = url;
            mediaElement.controls = true;
        }

        msgDiv.appendChild(idSpan);
        msgDiv.appendChild(mediaElement);
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    socket.on('user_count_update', (data) => {
        onlineUsersCountSpan.textContent = data.count;
    });

    function sendMessage() {
        const message = messageInput.value.trim();
        if (message && myUserId) {
            socket.emit('chat_message', { msg: message, user_id: myUserId });
            messageInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file && myUserId) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user_id', myUserId);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert('File upload failed!');
                }
            })
            .catch(error => {
                console.error('Error uploading file:', error);
                alert('Error uploading file!');
            });
        }
        fileInput.value = '';
    });
});