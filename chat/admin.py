from django.contrib import admin
from chat import models

# Register your models here.
admin.site.register(models.ChatMessage)
admin.site.register(models.ChatRoom)
admin.site.register(models.ChatUser)
