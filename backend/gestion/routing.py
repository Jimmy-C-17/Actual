from django.urls import re_path
from .consumers import UbicacionesConsumer

websocket_urlpatterns = [
    re_path(r'ws/ubicaciones/$', UbicacionesConsumer.as_asgi()),
]
