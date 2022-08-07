// Recien cuando se cargue todo el HTML comienzo a ejecutar...
document.addEventListener("DOMContentLoaded", function () {
    // App State holder....
    let state = {
        chatSocket: null,
        userData: null,
        storeSession: null,
        availableRooms: null
    };

    // ===================================================
    // Handlers Definitions....
    function performLogin() {
        let loginurl = `http://${window.location.host}/auth/login`
        let userNameValue = document.getElementById("loginusername").value
        let passwordValue = document.getElementById("loginpassword").value
        let keepSessionStored = document.getElementById("loginkeepsession").checked

        state.storeSession = keepSessionStored

        let req = new Request(loginurl, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{"username": "${userNameValue}","password": "${passwordValue}"}`
        });
        fetch(req)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Response not ok, probably wrong credentials...');
                }
                return response.json()
            })
            .then(data => {
                if (state.storeSession) {
                    sessionStorage.setItem('userData', JSON.stringify(data));
                }

                state.userData = data;

                renderRecents();
                renderChatOldMsgs();

                loginModal.hide();
                chatRoom.dispatchEvent(connectWS);
            })
            .catch(err => {
                console.log(`Error with the login: ${err}`)
                loginModal.show()
            });
    }

    function connectWebsocket() {
        if (state.chatSocket != null) {
            console.log("Closing WS Connection...")
            state.chatSocket.close(4000, 'Changing Room...')
        }
        state.chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${state.userData.user.last_used_room.id}/`);
        state.chatSocket.onmessage = (e) => {
            let data = JSON.parse(e.data)

            if (data.type === 'chat') {
                let messages = document.getElementById('messages')
                messages.insertAdjacentHTML('afterbegin', `<div class="message">
                        <div class="message-user">${data.user}</div>
                        <div class="message-text">${data.message}</div>
                        <div class="message-time">${data.time}</div>
                    </div>`)
            }
        };
    }

    function sendMessageHandler(e) {
        e.preventDefault()
        state.chatSocket.send(JSON.stringify({
            'message': e.target.message.value,
            'type': "chat",
            "subtype": null
        }))
        e.target.reset()
    }

    function renderChatOldMsgs() {
        let messages = document.getElementById('messages');
        messages.innerHTML = "";

        let url = `http://${window.location.host}/rooms/${state.userData.user.last_used_room.id}/messages`;
        let req = new Request(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${state.userData.token}`
            },
            method: "GET"
        });
        fetch(req)
            .then(response => response.json())
            .then(data => {
                data.forEach(data => {
                    messages.insertAdjacentHTML('afterbegin',
                        `<div class="message">
                            <div class="message-user">${data.from_user}</div>
                            <div class="message-text">${data.text}</div>
                            <div class="message-time">${data.received_at}</div>
                        </div>`)
                })
            })
            .catch(err => {
                console.log(`Error reading messages: ${err}`)
            });
    }

    function renderRecents() {
        let recents = document.getElementById('recents-ul');
        recents.innerHTML = "";

        state.userData.user.rooms_im_in.forEach(room => {
            recents.insertAdjacentHTML('afterbegin',
                `<li class="room">
                    <a href="#" id="r-room-${room.id}">
                        <i class="fa fa-users"></i>
                        <span>${room.room_name}</span>
                        <i class="fa fa-times" style="float: right;"></i>
                    </a>
                </li>`);
        })

    }

    function updateUserProfile(e) {
        e.preventDefault()
        let firstName = document.getElementById("profile-first").value;
        let lastName = document.getElementById("profile-last").value;
        let email = document.getElementById("profile-email").value;

        let url = `http://${window.location.host}/users/profile/${state.userData.user.id}`;
        let req = new Request(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${state.userData.token}`
            },
            method: "PUT",
            body: `{
                "id": ${state.userData.user.id},
                "first_name": "${firstName}",
                "last_name": "${lastName}",
                "email": "${email}"
            }`
        });
        fetch(req)
            .then(response => response.json())
            .then(data => {
                console.log("Returned data is: " + data);
                console.log("state.userData is: " + state.userData);
                // TODO: #14 Update state.userData with new info
                // TODO: #14 Update stored data (if it was stored... :wink:)
            })
            .catch(err => {
                console.log(err);
            })
    }

    function getUserInfo() {
        let url = `http://${window.location.host}/users/${state.userData.user.id}`;
        fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${state.userData.token}`
            },
            method: "GET"
        })
            .then(response => response.json())
            .then(data => {
                console.log("Returned data is: " + data);
                console.log("state.userData is: " + state.userData);
                // TODO: #14 Update state.userData with new info
                // TODO: #14 Update stored data (if it was stored... :wink:)
            })
            .catch(err => {
                console.log(err);
            })
    }

    function getAvailableRooms() {
        const roomsSelectWidget = document.getElementById("for-room");

        let url = `http://${window.location.host}/rooms`;
        let req = new Request(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${state.userData.token}`
            },
            method: "GET"
        });
        fetch(req)
            .then(response => response.json())
            .then(data => {
                state.availableRooms = data;
                roomsSelectWidget.innerHTML = "";
                roomsSelectWidget.insertAdjacentHTML("beforeend", "<option selected>Seleccione una sala...</option>")

                for (const room of data) {
                    roomsSelectWidget.insertAdjacentHTML("beforeend", `<option value="${room.id}">${room.room_name}</option>`)
                }
                roomsModal.show()
            })
            .catch(err => {
                console.log(`Error reading rooms: ${err}`)
            });
    }

    function changeActiveRoom(e) {
        var selectedRoom = state.availableRooms.filter(room => room.id == e.target.value)[0];
        var selectedRoomWasNotInRecents = !state.userData.user.rooms_im_in.filter(room => room.id == e.target.value).length;

        if (selectedRoomWasNotInRecents) {
            state.userData.user.rooms_im_in.push(selectedRoom)
        }

        state.userData.user.last_used_room.id = e.target.value;

        if (state.storeSession) {
            sessionStorage.setItem('userData', JSON.stringify(state.userData));
        }

        // TODO: #6 Highlight the slected room in the recents...
        renderChatOldMsgs();
        renderRecents();
        chatRoom.dispatchEvent(connectWS);
        updateSelectedRoomInDB();
        roomsModal.hide();
    }

    function updateSelectedRoomInDB() {
        let url = `http://${window.location.host}/users/${state.userData.user.id}/rooms`;
        let req = new Request(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${state.userData.token}`
            },
            method: "PUT",
            body: `{
                "last_used_room": "${state.userData.user.last_used_room.id}"
            }`
        });
        fetch(req)
            .then(response => response.json())
            .then(data => {
                console.log("Returned data from updateSelectedRoomInDB: " + data);
            })
            .catch(err => {
                console.log(err);
            })
    }

    // ================================================================
    // Assign Events to its corresponding Actions:

    // Bootstrap Modals
    const loginModal = new bootstrap.Modal('#login-modal');
    const roomsModal = new bootstrap.Modal('#rooms-list-modal');

    // Setup login handler
    const loginButton = document.getElementById("login-btn");
    loginButton.addEventListener("click", performLogin)

    // Setup the event to handle WebSocket connections...
    const connectWS = new Event('connectWS');
    const chatRoom = document.getElementById('chatroom');
    chatRoom.addEventListener('connectWS', connectWebsocket);

    // Setup the chatbox form
    var chatBox = document.getElementById('chat-box');
    chatBox.addEventListener('submit', sendMessageHandler);

    // Setup the update profile form
    const profileForm = document.getElementById("profile-form");
    profileForm.addEventListener('submit', updateUserProfile);

    // Setup the button to get the list of available rooms
    const roomsGetListBtn = document.getElementById("room-list-btn");
    roomsGetListBtn.addEventListener("click", getAvailableRooms);

    // Setup the room selector
    const roomsSelectWidget = document.getElementById("for-room");
    roomsSelectWidget.addEventListener("change", changeActiveRoom);

    /////////////////////////////////////////////////////////////////
    // Existe la info de usuario? o tenemos que mostrar el login??
    let stored = JSON.parse(sessionStorage.getItem('userData'))
    if (stored) {
        state.userData = stored
        renderRecents();
        renderChatOldMsgs();
        chatRoom.dispatchEvent(connectWS);
    } else {
        loginModal.show()
    }

});
