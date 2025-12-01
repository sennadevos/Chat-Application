const API_URL = 'http://localhost:8080/api';

let currentUser;
let currentChannel;

const channelsPanel = document.querySelector('.channels-panel')
const channelList = document.getElementById('channel-list');

const channelTitle = document.getElementById('channel-title');
const messageList = document.getElementById('message-list');
const messageField = document.getElementById("message-content");

function getRequestHeaders() {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken'),
    }
}

function returnToLogin() {
    window.location.href = '/login.html';
    sessionStorage.removeItem('accessToken');
}

function scrollDown(element) {
    element.scrollTop = element.scrollHeight;
}

function scrollDownSmooth(element) {
    element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth' // Optional: defines a smooth animation scroll
    });
}

let lastAuthorId;
function addMessage(message) {
    const messageListItem = document.createElement('li');
    messageListItem.appendChild(document.createTextNode(message.content));
    if (message.author.id === currentUser.id) {
        messageListItem.classList.add('me');
    }

    if (lastAuthorId !== message.author.id) {
        if (message.author.id !== currentUser.id) {
            messageList.appendChild(document.createElement('p')).innerText = message.author.username;
        }
        lastAuthorId = message.author.id;
    }
    messageList.appendChild(messageListItem);
}

function populateMessages(channel) {
    messageList.innerHTML = '';
    fetch(API_URL + `/channels/${channel.id}/messages`, { headers: getRequestHeaders() })
        .then(response => response.json())
        .then(json => {
            const messages = json.data;
            messages.forEach(message => {
                addMessage(message);
            })
            scrollDown(messageList);
        })
}

function populateChannels() {
    fetch(API_URL + '/users/@me', { headers: getRequestHeaders() })
        .then(response => response.json())
        .then(json => {
            // TODO -- Move this to a separate function
            currentUser = json.data;
            const channels = json.data.channels;

            channelList.innerHTML = '';
            channels.forEach((channel) => {
                const channelListItem = document.createElement('li');
                channelListItem.appendChild(document.createTextNode(channel.name));
                channelListItem.onclick = () => {
                    if (window.matchMedia("@media (max-width: 600px)").matches) {
                        // TODO -- hide channels
                    }
                    channelTitle.innerText = channel.name;
                    populateMessages(channel);
                    currentChannel = channel;
                }
                channelList.appendChild(channelListItem);
            })

            const lastChannel = channels[channels.length - 1];
            channelTitle.innerText = lastChannel.name;
            populateMessages(lastChannel);
        })
}

function sendMessage() {
    let requestBody = { content: messageField.value };
    console.log(requestBody);

    fetch(API_URL + `/channels/${currentChannel.id}/messages`,
        { method: 'POST', headers: getRequestHeaders(), body: JSON.stringify(requestBody) })
        .then(response => response.json())
        .then(json => {
            if (json.code === 200) {
                messageField.value = '';
            }
        })
}

document.getElementById('send-button').addEventListener('click', sendMessage);

document.addEventListener('DOMContentLoaded', () => {
    populateChannels();

    let socket = new WebSocket('wss://chat.hethond.com/api/ws?token=' + sessionStorage.getItem('accessToken'));
    let stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        console.log("Connected")
        stompClient.subscribe('/user/topic/messages', function (stompMessage) {
            let message = JSON.parse(stompMessage.body);
            if (message.channel.id === currentChannel.id) {
                addMessage(message);
                scrollDownSmooth(messageList);
            }
        });
    });
});