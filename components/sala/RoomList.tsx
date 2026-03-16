"use client"

import styles from "@/styles/roomlist.module.css"
import RoomCard from "@/components/sala/Roomcard"

interface RoomListProps{
  rooms:any[]
}

export default function RoomList({ rooms }:RoomListProps){

  return(
    <div className={styles.carrossel}>
      <div className={styles.group}>

        {rooms.map((room)=>(
          <RoomCard
            key={room.id_room}
            room={room}
          />
        ))}

      </div>
    </div>
  )
}