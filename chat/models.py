from django.db import models
from shatapp import settings
from django.contrib.auth.models import AbstractUser

# Create your models here.
class ChatUser(AbstractUser):
    rooms_im_in = models.ManyToManyField(to="ChatRoom", blank=True)
    last_used_room = models.ForeignKey(
        to="ChatRoom",
        on_delete=models.DO_NOTHING,
        blank=True,
        null=True,
        related_name="last_room",
    )

    def __str__(self) -> str:
        return self.username


class DirectChat(models.Model):
    pass


class ChatRoom(models.Model):
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    created_by = models.ForeignKey(
        to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    room_name = models.CharField(max_length=50)
    room_topic = models.TextField()

    def __str__(self) -> str:
        return self.room_name


class ChatMessage(models.Model):
    received_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    text = models.TextField()
    room = models.ForeignKey(to=ChatRoom, on_delete=models.CASCADE)
    from_user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING
    )

    class Meta:
        ordering = ["received_at"]

    def __str__(self) -> str:
        return f"Message from {self.from_user.first_name} to room {self.room.room_name}"
