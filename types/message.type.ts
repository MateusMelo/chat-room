import { Client } from "./client.type"

export type Message = {
  type: 'connected' | 'typing' | 'message'
  client: Client
  value: string
  timestamp: Date
}
