import RoomList from "../components/chat/RoomList"
import ChatBox from "../components/chat/ChatBox"

export default function ChatPage(){

  return(
    <div style={{display:"flex"}}>

      <RoomList />

      <ChatBox />

    </div>
  )
}