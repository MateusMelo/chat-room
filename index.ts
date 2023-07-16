import WebSocket, { RawData, WebSocketServer } from 'ws'
import { Message } from './types/message.type'

const PORT = 3000
const server = new WebSocketServer({ port: PORT })

server.on('connection', (socket: WebSocket) => {
  socket.on('error', console.error)
  socket.on('message', (data: RawData) => {
    let message: Message
    try {
      message = JSON.parse(data.toString())
    } catch (e) {
      throw e
    }

    console.log(message)

    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        if (message.type === 'connected') {
          if (client !== socket) {
            client.send(
              JSON.stringify({
                client: {
                  id: 'server',
                  name: 'Server',
                },
                type: message.type,
                value: `${message.client.name} is now connected`,
                timestamp: new Date(),
              }),
            )
          }
        } else if (message.type === 'typing') {
          if (client !== socket) {
            client.send(
              JSON.stringify({
                client: message.client,
                type: message.type,
                value: message.value,
                timestamp: new Date(),
              }),
            )
          }
        } else if (message.type === 'message') {
          client.send(JSON.stringify(message))
        }
      }
    })
  })
})

server.on('listening', () => {
  console.log('Listening on port %d', PORT)
})
