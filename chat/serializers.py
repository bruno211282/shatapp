from dataclasses import fields
from rest_framework import serializers
from chat.models import ChatUser, ChatRoom


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatUser
        fields = ["username", "first_name", "last_name", "email", "rooms_im_in"]


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = "__all__"
