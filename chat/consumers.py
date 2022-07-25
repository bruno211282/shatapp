import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from chat.models import ChatMessage, ChatRoom, ChatUser
import datetime


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        room_id = int(self.scope["url_route"]["kwargs"]["room_id"])
        self.room = ChatRoom.objects.get(pk=room_id)
        self.room_group_name = f"chat_room_{room_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        print(data)

        if data["type"] == "chat":
            msg_to_db = ChatMessage(
                text=data["message"], from_user=self.scope["user"], room=self.room
            )
            msg_to_db.save()

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                # Esto dispara un "evento" que luego "llama" un metodo del mismo nombre...
                {
                    "type": "chat.message",
                    "message": data["message"],
                    "user": self.scope["user"],
                    "time": msg_to_db.received_at.strftime("%H:%M"),
                },
            )

    def chat_message(self, event):
        message = event["message"]
        user = event["user"].first_name
        time = event["time"]

        self.send(
            text_data=json.dumps(
                {"type": "chat", "message": message, "user": user, "time": time}
            )
        )
