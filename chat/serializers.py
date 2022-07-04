from dataclasses import fields
from rest_framework import serializers
from chat.models import ChatUser, ChatRoom
from django.contrib.auth import authenticate


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatUser
        fields = ["id", "username", "first_name", "last_name", "email", "rooms_im_in"]


class CreateChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatUser
        fields = [
            "id",
            "username",
            "password",
            "email",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return ChatUser.objects.create_user(
            validated_data["username"],
            validated_data["email"],
            validated_data["password"],
        )


class LoginChatUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if user.is_active:
            return user

        raise serializers.ValidationError("Incorrect Credentials!")


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = "__all__"
