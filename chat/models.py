from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class ChatUser(User):
    rooms_im_in = models.ForeignKey(
        to="ChatRoom", on_delete=models.CASCADE, null=True, blank=True
    )


class ChatRoom(models.Model):
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    created_by = models.ForeignKey(to=User, on_delete=models.CASCADE)
    room_name = models.CharField(max_length=50)
    room_topic = models.TextField()

    def __str__(self) -> str:
        return self.room_name


class ChatMessage(models.Model):
    received_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    text = models.TextField()
    room = models.ForeignKey(to=ChatRoom, on_delete=models.CASCADE)
    from_user = models.ForeignKey(to=User, on_delete=models.DO_NOTHING)

    class Meta:
        ordering = ["received_at"]
