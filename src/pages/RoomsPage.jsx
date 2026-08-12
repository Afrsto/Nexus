import { useEffect } from "react";
import { useParams } from "react-router-dom";
import RoomSidebar from "@/components/rooms/RoomSidebar";
import RoomView from "@/components/rooms/RoomView";
import { useRoomStore } from "@/store/useRoomStore";

export default function RoomsPage() {
  const { roomId, channelId } = useParams();
  const rooms = useRoomStore((s) => s.rooms);
  const activeRoom = useRoomStore((s) => s.activeRoom);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);
  const setActiveChannel = useRoomStore((s) => s.setActiveChannel);

  useEffect(() => {
    if (!roomId) {
      if (activeRoom) setActiveRoom(null);
      setActiveChannel(null);
      return;
    }

    const room = rooms.find((r) => r.id === Number(roomId));
    if (!room) {
      setActiveRoom(null);
      setActiveChannel(null);
      return;
    }

    if (activeRoom?.id !== room.id) {
      setActiveRoom(room);
    }

    if (channelId) {
      const channel = room.channels.find((c) => c.id === Number(channelId));
      setActiveChannel(channel || null);
    } else {
      setActiveChannel(null);
    }
  }, [roomId, channelId, rooms, activeRoom, setActiveRoom, setActiveChannel]);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <RoomSidebar />
      <RoomView />
    </div>
  );
}
