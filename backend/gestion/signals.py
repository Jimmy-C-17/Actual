from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Chofer

@receiver(post_save, sender=Chofer)
def crear_usuario_automatico(sender, instance, created, **kwargs):
    if created and not instance.user:
        nuevo_usuario = User.objects.create_user(
            username=instance.ci,
            password=instance.ci,
            first_name=instance.nombre_completo
        )
        instance.user = nuevo_usuario
        instance.save()