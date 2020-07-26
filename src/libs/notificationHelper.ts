export default io => {
  sendNotification: notification => {
    io.on("connection", function(socket) {
      socket.emit("news", notification);
    });
  };
};
