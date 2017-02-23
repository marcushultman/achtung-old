package main

import (
  "log"
  "net/http"
  "github.com/googollee/go-socket.io"
)

type SocketServer struct {
  Server *socketio.Server
}
func (s *SocketServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
  origin := r.Header.Get("Origin")
  w.Header().Set("Access-Control-Allow-Origin", origin)
  w.Header().Set("Access-Control-Allow-Credentials", "true")
  s.Server.ServeHTTP(w, r)
}

func main() {
  connections := make(map[string]socketio.Socket);
  ioServer, err := socketio.NewServer(nil)
  if err != nil {
    log.Fatal(err)
  }
  ioServer.On("connection", func(so socketio.Socket) {
    connections[so.Id()] = so;
    log.Println(connections)
    so.On("peer_use", func(id string) {
      // if id not in connection return
      so.Emit(id + "open")
    })
    so.On("peer_connect", func(id string) {
      // if id not in connection return
      connections[id].Emit("connection", so.Id())
      so.Emit(id + "open")
    })
    so.On("peer_data", func(id string, msg string) {
      // if id not in connection return
      log.Println("data", id, msg);
      // connections[id].Emit(so.Id() + "data", msg)
    })
    disconnection := func(id string) {
      delete(connections, id)
      log.Println(connections)
    }
    // so.On("peer_disconnect", disconnection)
    so.On("disconnect", disconnection)
    so.On("disconnecting", disconnection)
  })
  ioServer.On("error", func(so socketio.Socket, err error) {
    log.Println("error:", err)
  })
  wsServer := new(SocketServer)
  wsServer.Server = ioServer
  http.Handle("/", wsServer)
  // http.Handle("/socket.io/", server)
  // http.Handle("/", http.FileServer(http.Dir("./asset")))
  log.Println("Serving at localhost:5000...")
  log.Fatal(http.ListenAndServe(":5000", nil))
}
