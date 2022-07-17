from dataclasses import fields
from rest_framework import serializers
from chat.models import ChatUser, ChatRoom, ChatMessage
from django.contrib.auth import authenticate, login


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = "__all__"


class ChatUserSerializer(serializers.ModelSerializer):
    rooms_im_in = ChatRoomSerializer(many=True, read_only=True)
    last_used_room = ChatRoomSerializer()

    class Meta:
        model = ChatUser
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "rooms_im_in",
            "last_used_room",
        ]


class ChatUserUpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatUser
        fields = ["id", "first_name", "last_name", "email"]


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

        if user is not None and user.is_active:
            login(self.context["request"], user)
            return user

        raise serializers.ValidationError("Incorrect Credentials!")


class TimeListingField(serializers.DateTimeField):
    def to_representation(self, value):
        return value.strftime("%H:%M")


class UserListingField(serializers.StringRelatedField):
    def to_representation(self, value):
        return value.first_name


class ChatMessageSerializer(serializers.Serializer):
    from_user = UserListingField()
    received_at = TimeListingField()
    text = serializers.CharField()

    class Meta:
        model = ChatMessage
        fields = ["from_user", "received_at", "text"]
