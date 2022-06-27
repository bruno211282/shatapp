let url = `ws://${window.location.host}/ws/socket-server/`

const chatSocket = new WebSocket(url)

chatSocket.onmessage = function(e){
    let data = JSON.parse(e.data)
    console.log('data: ', data)

    if (data.type === 'chat'){
        let messages = document.getElementById('messages')
        messages.insertAdjacentHTML('afterbegin', `<div class="message">
                    <div class="message-user">${data.user}</div>
                    <div class="message-text">${data.message}</div>
                    <div class="message-time">${data.time}</div>
                </div>`)
    }
}

let form = document.getElementById('form')
form.addEventListener('submit', (e)=> {
    e.preventDefault()
    let message = e.target.message.value
    chatSocket.send(JSON.stringify({
        'message': message
    }))
    form.reset()
})