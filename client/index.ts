const socket = new WebSocket('ws://localhost:3000')

const random = Math.round(Math.random() * 100)
const client = {
  id: `id_${random}`,
  name: `Client ${random}`,
}

const writeMessage = (username: string, text: string) => {
  const messagesNode = document.getElementById('messages') as HTMLDivElement
  const messageNode: HTMLDivElement = document.createElement('div')
  const spanNode: HTMLSpanElement = document.createElement('span')
  messageNode.classList.add('message')
  spanNode.classList.add('user_name')

  spanNode.appendChild(document.createTextNode(`${username} `))
  messageNode.appendChild(spanNode)
  messageNode.appendChild(document.createTextNode(text))
  messagesNode.appendChild(messageNode)
}

const isTypingNode = document.getElementById('istyping') as HTMLDivElement
const setTypingStatusForUsername = (
  node: HTMLDivElement,
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

socket.addEventListener('open', () => {
  //   writeMessage("Connected to: ws://localhost:3000");
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
      isTypingNode,
      message.value !== '' ? message.client.name : null,
    )
  } else {
    writeMessage(message.client.name, message.value)
  }
})

socket.addEventListener('close', () => {
  //   writeMessage("Disconnected");
})

socket.addEventListener('error', () => {
  //   writeMessage("Failed to connect at ws");
})

const buttonElement = document.getElementById('send') as HTMLButtonElement
const inputElement = document.getElementById('input') as HTMLInputElement

const handleClick = (input: HTMLInputElement) => {
  if (input.value === '') return
  socket.send(
    JSON.stringify({
      type: 'message',
      client,
      value: input.value,
    }),
  )
  input.value = ''
}
const handleKeyUp = (e: KeyboardEvent) => {
  const input = e.target as HTMLInputElement

  socket.send(
    JSON.stringify({
      type: 'typing',
      client,
      value: input.value,
    }),
  )
}

buttonElement.addEventListener('click', () => handleClick(inputElement))
inputElement.addEventListener('keyup', handleKeyUp)
