from django.shortcuts import render
from chat.models import ChatRoom, ChatUser
from chat.serializers import ChatRoomSerializer, ChatUserSerializer
from rest_framework import generics


def chatroom(request):
    return render(request, "chat/elmio.html")


class ChatRoomsList(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer


class ChatRoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
