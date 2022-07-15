document.addEventListener("DOMContentLoaded", function () {
    let userIsLoggedIn = false;
    let token = "";
    let userName = "";
    let userId = "";
    let roomId = "1";

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
                let token = "";
                let userName = "";
                let userId = "";
                console.log(data)
                userIsLoggedIn = true;
                loginModal.hide()
            })
            .catch(err => {
                console.log(`Error with the login: ${err}`)
                loginModal.show()
            });
    })

    const chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/1/`);
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
            'user': userName,
            'room': roomId
        }))
        chatBox.reset()
    });


    if (!userIsLoggedIn) {
        loginModal.show()
    }





    // // Login functionalities...
    // let userData = JSON.parse(sessionStorage.getItem('userData'))


    // function loginUser() {

    //

    // }

    // function populateChat(room) {
    //     let messages = document.getElementById('messages');

    //     let url = `http://${window.location.host}/rooms/${room}/messages`;
    //     let req = new Request(url, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Token ${token}`
    //         },
    //         method: "GET"
    //     });
    //     fetch(req)
    //         .then(response => response.json())
    //         .then(data => {
    //             data.forEach(data => {
    //                 messages.insertAdjacentHTML('afterbegin',
    //                     `<div class="message">
    //                         <div class="message-user">${data.from_user}</div>
    //                         <div class="message-text">${data.text}</div>
    //                         <div class="message-time">${data.received_at}</div>
    //                     </div>`)
    //             })
    //         })
    //         .catch(err => {
    //             console.log(`Error reading messages: ${err}`)
    //         });
    // }

    // function setupChatApp() {
    //     // Setup Websocket...


    //     populateChat(roomId);
    // }


});
