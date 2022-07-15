from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from knox.models import AuthToken
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from chat.models import ChatRoom, ChatUser, ChatMessage
from chat.serializers import (
    ChatRoomSerializer,
    ChatUserSerializer,
    ChatMessageSerializer,
    CreateChatUserSerializer,
    LoginChatUserSerializer,
    UserSerializer,
)


def chatroom(request):
    return render(request, "chat/app.html")


class ChatRoomsList(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]


class ChatMessageList(generics.ListAPIView):
    def get_queryset(self):
        self.room = get_object_or_404(ChatRoom, pk=self.kwargs["room"])
        return ChatMessage.objects.filter(room=self.room)

    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]


class ChatRoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# Users views/apis!
class ListChatUsers(generics.ListAPIView):
    queryset = ChatUser.objects.all()
    serializer_class = ChatUserSerializer
    permission_classes = [IsAuthenticated]


class ChatUserDetail(generics.RetrieveAPIView):
    queryset = ChatUser.objects.all()
    serializer_class = ChatUserSerializer
    permission_classes = [IsAuthenticated]


class CreateChatUser(generics.CreateAPIView):
    serializer_class = CreateChatUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        return Response(
            {
                "user": ChatUserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": AuthToken.objects.create(user)[1],
            }
        )


class LoginChatUser(generics.GenericAPIView):
    serializer_class = LoginChatUserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data
        return Response(
            {
                "user": UserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": AuthToken.objects.create(user)[1],
            }
        )
