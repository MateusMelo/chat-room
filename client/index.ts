let socket: WebSocket

type Client = {
  id: string
  username: string
}

let client: Client
const isTypingInfoElement = document.getElementById(
  'is-typing',
) as HTMLSpanElement
const sendElement = document.getElementById('send-message') as HTMLButtonElement
const sendUsernameElement = document.getElementById(
  'send-username',
) as HTMLButtonElement
const inputElement = document.getElementById(
  'message-value',
) as HTMLInputElement
const usernameElement = document.getElementById('username') as HTMLInputElement
const messagesWrapper = document.getElementById(
  'messages-wrapper',
) as HTMLDivElement
const userInfoWrapper = document.getElementById(
  'userinfo-wrapper',
) as HTMLDivElement

const writeMessage = (username: string, text: string) => {
  const messagesElement = document.getElementById('messages') as HTMLDivElement
  const messageNode: HTMLDivElement = document.createElement('div')
  const spanNode: HTMLSpanElement = document.createElement('span')
  messageNode.classList.add('message')
  spanNode.classList.add('username')

  spanNode.appendChild(document.createTextNode(`${username}: `))
  messageNode.appendChild(spanNode)
  messageNode.appendChild(document.createTextNode(text))
  messagesElement.appendChild(messageNode)

  messagesElement.scrollTop = messagesElement.scrollHeight
}

const setTypingStatusForUsername = (
  node: HTMLSpanElement,
  username: string | null,
) => {
  if (username === null) {
    node.innerHTML = ''
    return
  }

  if (!node.hasChildNodes()) {
    const span: HTMLSpanElement = document.createElement('span')
    span.classList.add('user_name')
    span.appendChild(document.createTextNode(`${username} `))
    node.appendChild(span)
    node.appendChild(document.createTextNode('is typing'))
  }

  return
}

const onClickSendUsername = (e: MouseEvent) => {
  const typedUsername = usernameElement.value
  if (typedUsername === '') e.preventDefault()

  client = {
    username: typedUsername,
    id: Math.round(Math.random() * 100).toString(),
  }

  messagesWrapper.classList.remove('hide')
  userInfoWrapper.classList.add('hide')

  socket = new WebSocket('ws://localhost:3000')

  socket.addEventListener('open', () => {
    console.log('Connected to: ws://localhost:3000')
    socket.send(JSON.stringify({ type: 'connected', client }))
  })

  socket.addEventListener('message', (event: MessageEvent<any>) => {
    let message
    try {
      message = JSON.parse(event.data)
    } catch (e) {
      throw e
    }

    if (message.type === 'typing') {
      setTypingStatusForUsername(
        isTypingInfoElement,
        message.value !== '' ? message.client.username : null,
      )
    } else {
      setTypingStatusForUsername(isTypingInfoElement, null)
      writeMessage(message.client.username, message.value)
    }
  })

  socket.addEventListener('close', () => {
    //   writeMessage("Disconnected");
  })

  socket.addEventListener('error', () => {
    //   writeMessage("Failed to connect at ws");
  })
}
const sendMessage = (value: string) => {
  if (!value) return
  socket.send(
    JSON.stringify({
      type: 'message',
      client,
      value,
    }),
  )
}
const onClickSendMessage = (e: MouseEvent) => {
  sendMessage(inputElement.value)
  inputElement.value = ''
}
const onKeyUpMessage = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    sendMessage(inputElement.value)
    inputElement.value = ''
    return
  }
  const input = e.target as HTMLInputElement

  socket.send(
    JSON.stringify({
      type: 'typing',
      client,
      value: input.value,
    }),
  )
}

sendUsernameElement.addEventListener('click', onClickSendUsername)
sendElement.addEventListener('click', onClickSendMessage)
inputElement.addEventListener('keyup', onKeyUpMessage)
