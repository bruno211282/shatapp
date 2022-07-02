from email import message
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
        text_json = json.loads(text_data)
        message = text_json["message"]
        received_at = datetime.datetime.now()

        print(text_json)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {"type": "chat_message"},
        )

        self.msg_to_db = ChatMessage(
            text=message, from_user=self.scope["user"], room=self.room
        )
        self.msg_to_db.save()

    def chat_message(self, event):
        message = self.msg_to_db.text
        user = self.msg_to_db.from_user.first_name
        time = f"{self.msg_to_db.received_at.hour}:{self.msg_to_db.received_at.minute}"

        self.send(
            text_data=json.dumps(
                {"type": "chat", "message": message, "user": user, "time": time}
            )
        )
