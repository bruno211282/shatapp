from django.urls import path
from chat import views
from knox.views import LogoutView

urlpatterns = [
    path("", views.chatroom, name="chatroom"),
    path("login", views.login),
    path("rooms", views.ChatRoomsList.as_view()),
    path("rooms/<int:pk>", views.ChatRoomDetail.as_view()),
    path("users", views.ListChatUsers.as_view()),
    path("users/<int:pk>", views.ChatUserDetail.as_view()),
    path("auth/register", views.CreateChatUser.as_view()),
    path("auth/login", views.LoginChatUser.as_view()),
    path("auth/logout", LogoutView.as_view()),
]
