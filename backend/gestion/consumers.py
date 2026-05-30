from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import Ubicacion
from .serializers import UbicacionSerializer

class UbicacionesConsumer(AsyncJsonWebsocketConsumer):
    group_name = 'ubicaciones'

    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        try:
            ubicaciones = await sync_to_async(list)(Ubicacion.objects.order_by('-actualizado')[:50])
            serializer = UbicacionSerializer(ubicaciones, many=True)

            await self.send_json({
                'action': 'init',
                'ubicaciones': serializer.data,
            })
        except Exception as e:
            print(f"Error en WebSocket connect: {e}")
            await self.send_json({
                'action': 'error',
                'message': str(e),
            })

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get('action')
        if action != 'update':
            return

        nombre = content.get('nombre', 'Usuario')
        tipo = content.get('tipo', 'chofer')
        lat = content.get('lat')
        lng = content.get('lng')

        if lat is None or lng is None:
            return

        ubicacion, _ = await sync_to_async(Ubicacion.objects.update_or_create)(
            nombre=nombre,
            tipo=tipo,
            defaults={
                'latitud': lat,
                'longitud': lng,
            }
        )

        serializer = UbicacionSerializer([ubicacion], many=True)
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'broadcast_ubicaciones',
                'ubicaciones': serializer.data,
            }
        )

    async def broadcast_ubicaciones(self, event):
        await self.send_json({
            'action': 'broadcast',
            'ubicaciones': event['ubicaciones'],
        })
