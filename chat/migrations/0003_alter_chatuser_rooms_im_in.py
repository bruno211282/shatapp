# Generated by Django 4.0.5 on 2022-07-01 23:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_chatroom_room_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chatuser',
            name='rooms_im_in',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='chat.chatroom'),
        ),
    ]
