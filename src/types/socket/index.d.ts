import "socket.io-client"

declare global {
  type SocketAuth = {
    token: string
  }
}

declare module "socket.io-client" {
  interface ManagerOptions {
    auth?: SocketAuth
  }
}

export {}
