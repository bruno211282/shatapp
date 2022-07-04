from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from knox.models import AuthToken
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from chat.models import ChatRoom, ChatUser
from chat.serializers import (
    ChatRoomSerializer,
    ChatUserSerializer,
    CreateChatUserSerializer,
    LoginChatUserSerializer,
)


def login(request):
    return render(request, "chat/login.html")


@login_required(login_url="/login")
def chatroom(request):
    return render(request, "chat/app.html")


class ChatRoomsList(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ChatRoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# Users views/apis!
class ListChatUsers(generics.ListAPIView):
    queryset = ChatUser.objects.all()
    serializer_class = ChatUserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ChatUserDetail(generics.RetrieveAPIView):
    queryset = ChatUser.objects.all()
    serializer_class = ChatUserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


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

        user = serializer.validate_data
        return Response(
            {
                "user": ChatUserSerializer(
                    user, context=self.get_serializer_context()
                ).data,
                "token": AuthToken.objects.create(user)[1],
            }
        )
