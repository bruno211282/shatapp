document.addEventListener("DOMContentLoaded", function () {
    let token = "";
    let userName = "";
    let userId = "";
    let roomId = "";
    let roomsImIn = "";

    const connectWS = new Event('connectWS');
    const chatRoom = document.getElementById('chatroom');
    const loginModal = new bootstrap.Modal('#login-modal');
    const loginButton = document.getElementById("login-btn");


    loginButton.addEventListener("click", function (e) {
        console.log(e)
        let loginurl = `http://${window.location.host}/auth/login`
        let username = document.getElementById("loginusername").value
        let password = document.getElementById("loginpassword").value
        let keepsession = document.getElementById("loginkeepsession").value
        console.log("Session should be saved: " + keepsession)

        let req = new Request(loginurl, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: `{"username": "${username}","password": "${password}"}`
        });
        fetch(req)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Response not ok, probably wrong credentials...');
                }
                return response.json()
            })
            .then(data => {
                sessionStorage.setItem('userData', JSON.stringify(data));

                console.log(data)
                token = data.token;
                userName = data.user.first_name;
                userId = data.user.id;
                roomId = data.user.last_used_room.id;
                roomsImIn = data.user.rooms_im_in;
                populateRecents(roomsImIn);
                populateChat(roomId);
                loginModal.hide();
                chatRoom.dispatchEvent(connectWS);
            })
            .catch(err => {
                console.log(`Error with the login: ${err}`)
                loginModal.show()
            });
    })



    chatRoom.addEventListener('connectWS', function () {
        const chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${roomId}/`);
        chatSocket.onmessage = function (e) {
            var data = JSON.parse(e.data)
            console.log('Socket message: ', e)

            if (data.type === 'chat') {
                var messages = document.getElementById('messages')
                messages.insertAdjacentHTML('afterbegin', `<div class="message">
                        <div class="message-user">${data.user}</div>
                        <div class="message-text">${data.message}</div>
                        <div class="message-time">${data.time}</div>
                    </div>`)
            }
        };

        // Setup the chatbox form
        var chatBox = document.getElementById('chat-box');
        chatBox.addEventListener('submit', function (e) {
            e.preventDefault()
            var message = e.target.message.value
            chatSocket.send(JSON.stringify({
                'message': message,
                'type': "chat",
                "subtype": null
            }))
            chatBox.reset()
        });
    });


    // Muestro el login???
    let userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData) {
        token = userData.token;
        userName = userData.user.first_name;
        userId = userData.user.id;
        roomId = userData.user.last_used_room.id;
        roomsImIn = userData.user.rooms_im_in;
        populateRecents(roomsImIn);
        populateChat(roomId);
        chatRoom.dispatchEvent(connectWS);
    } else {
        loginModal.show()
    }



    function populateChat(room) {
        let messages = document.getElementById('messages');

        let url = `http://${window.location.host}/rooms/${room}/messages`;
        let req = new Request(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
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

    function populateRecents(recentRooms) {
        let recents = document.getElementById('recents-ul');

        recentRooms.forEach(room => {
            recents.insertAdjacentHTML('afterbegin',
                `<li class="room">
                    <a href="#" id="r-room-${room.id}">
                        <i class="fa fa-users"></i>
                        <span>${room.room_name}</span>
                        <i class="fa fa-times" style="float: right;"></i>
                    </a>
                </li>`)
        })

    }

    const profileForm = document.getElementById("profile-form");
    const profileFirstName = document.getElementById("profile-first");
    const profileLastName = document.getElementById("profile-last");
    const profileEMail = document.getElementById("profile-email");
    profileForm.addEventListener('submit', function (e) {
        e.preventDefault()
        let firstName = profileFirstName.value
        console.log(firstName);
        let lastName = profileLastName.value
        console.log(lastName);
        let email = profileEMail.value
        console.log(email);

        let url = `http://${window.location.host}/users/profile/${userId}`;
        let req = new Request(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            method: "PUT",
            body: `{
                "id": ${userId},
                "first_name": "${firstName}",
                "last_name": "${lastName}",
                "email": "${email}"
            }`
        });
        fetch(req)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                userName = data.first_name
            })
            .catch(err => {
                console.log(err);
            })
    });

});
