export const NoteSoceket = (io, socket) => {
  socket.on("NoteRoomMessage", (data) => {
    const { noteId, title, description, from } = data;
    io.in(noteId).emit("NoteRoomMessage", { title, description, from });
    console.log(`Message sent to room ${noteId}: ${description}`);
  });
};

//first the group of user join room then
// then user can send message through the Roommessage event
// we listen for than event in server and brodcast to all users in that room
// then the client side or frontend is also listnening for roommessage event to show message in ui

//now how to create room for any note . we don't have to make room for
//ever note only for the note who have collaborators so have to add
