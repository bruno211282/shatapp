from django.urls import path
from chat import views

urlpatterns = [
    path("", views.chatroom, name="chatroom"),
    path("rooms/", views.ChatRoomsList.as_view()),
    path("rooms/<int:pk>/", views.ChatRoomDetail.as_view()),
]
