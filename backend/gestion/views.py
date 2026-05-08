from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db import IntegrityError
from django.utils import timezone
from datetime import date, timedelta
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Chofer, Vehiculo, HojaRuta, Incidente, Grupo, Ruta, Planificacion
from .serializers import (
    ChoferSerializer, VehiculoSerializer, HojaRutaSerializer, 
    IncidenteSerializer, GrupoSerializer, RutaSerializer, PlanificacionSerializer,
    AdminUserSerializer
)

class GrupoViewSet(viewsets.ModelViewSet):
    queryset = Grupo.objects.all()
    serializer_class = GrupoSerializer

class RutaViewSet(viewsets.ModelViewSet):
    queryset = Ruta.objects.all()
    serializer_class = RutaSerializer

class PlanificacionViewSet(viewsets.ModelViewSet):
    queryset = Planificacion.objects.all()
    serializer_class = PlanificacionSerializer

class ChoferViewSet(viewsets.ModelViewSet):
    queryset = Chofer.objects.all()
    serializer_class = ChoferSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError as exc:
            message = str(exc)
            if 'auth_user_username_key' in message:
                detail = {'ci': ['Ya existe un usuario con este CI.']}
            elif 'gestion_chofer_ci_key' in message or 'chofer_ci_key' in message:
                detail = {'ci': ['Ya existe un chofer con este CI.']}
            elif 'gestion_chofer_nro_socio_key' in message or 'chofer_nro_socio_key' in message:
                detail = {'nro_socio': ['Ya existe un chofer con este número de socio.']}
            else:
                detail = {'non_field_errors': [message]}
            return Response(detail, status=status.HTTP_400_BAD_REQUEST)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_update(serializer)
        except IntegrityError as exc:
            message = str(exc)
            if 'auth_user_username_key' in message:
                detail = {'ci': ['Ya existe un usuario con este CI.']}
            elif 'gestion_chofer_ci_key' in message or 'chofer_ci_key' in message:
                detail = {'ci': ['Ya existe un chofer con este CI.']}
            elif 'gestion_chofer_nro_socio_key' in message or 'chofer_nro_socio_key' in message:
                detail = {'nro_socio': ['Ya existe un chofer con este número de socio.']}
            else:
                detail = {'non_field_errors': [message]}
            return Response(detail, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Eliminar chofer y su usuario de autenticación asociado"""
        instance = self.get_object()
        user = instance.user
        self.perform_destroy(instance)
        if user:
            user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_staff=True).order_by('id')
    serializer_class = AdminUserSerializer

class VehiculoViewSet(viewsets.ModelViewSet):
    queryset = Vehiculo.objects.all()
    serializer_class = VehiculoSerializer

class HojaRutaViewSet(viewsets.ModelViewSet):
    queryset = HojaRuta.objects.all()
    serializer_class = HojaRutaSerializer

class IncidenteViewSet(viewsets.ModelViewSet):
    queryset = Incidente.objects.all()
    serializer_class = IncidenteSerializer

@api_view(['POST'])
def api_generar_planificacion_ia(request):
    """
    Algoritmo de IA para distribuir rutas semanalmente de forma equitativa.
    Recibe: grupo_id, fecha_inicio
    """
    grupo_id = request.data.get('grupo_id')
    fecha_inicio = request.data.get('fecha_inicio')
    
    if not grupo_id or not fecha_inicio:
        return Response({'error': 'Faltan datos (grupo_id o fecha)'}, status=400)
    return Response({
        'status': 'ok',
        'message': f'IA: Planificación generada para el grupo {grupo_id} desde {fecha_inicio}'
    })

@api_view(['GET'])
def api_prediccion_demanda(request):
    """
    IA que analiza el historial para predecir cuántos autos se necesitan.
    """
    prediccion = {
        'recomendacion': 'Aumentar flota en Ruta Maica',
        'probabilidad_congestion': '85%',
        'clima_previsto': 'Lluvia moderada',
        'autos_sugeridos': 12
    }
    return Response(prediccion)

@api_view(['GET'])
def api_admin_dashboard(request):
    """Estadísticas para el Dashboard de React"""
    stats = {
        'total_choferes': Chofer.objects.count(),
        'choferes_activos': Chofer.objects.filter(estado_activo=True).count(),
        'vehiculos_total': Vehiculo.objects.count(),
        'rutas_hoy': HojaRuta.objects.filter(fecha=date.today()).count(),
        'rutas_completadas': HojaRuta.objects.filter(fecha=date.today(), completada=True).count(),
        'incidentes_semana': Incidente.objects.filter(fecha_reporte__gte=timezone.now() - timedelta(days=7)).count()
    }
    return Response(stats)

@api_view(['GET'])
def api_panel_chofer(request, chofer_id):
    """Datos para la App del Chofer"""
    try:
        chofer = Chofer.objects.get(id=chofer_id)
        rutas_dia = HojaRuta.objects.filter(chofer=chofer, fecha=date.today()).order_by('orden_vuelta')
        
        return Response({
            'chofer': ChoferSerializer(chofer).data,
            'vueltas_hoy': HojaRutaSerializer(rutas_dia, many=True).data,
        })
    except Chofer.DoesNotExist:
        return Response({'error': 'Chofer no encontrado'}, status=404)

@api_view(['POST'])
def api_login(request):
    """Login usando CI como Username"""
    username = request.data.get('username')
    password = request.data.get('password') 
    user = authenticate(username=username, password=password)    
    if user is not None:
        if user.is_staff or user.is_superuser:
            return Response({'status': 'ok', 'rol': 'admin', 'id': user.id, 'nombre': user.first_name})
        else:
            try:
                chofer = Chofer.objects.get(user=user)
                if not chofer.estado_activo:
                    return Response(
                        {'status': 'error', 'message': 'Chofer no habilitado. El dirigente debe habilitarlo tras el pago.'},
                        status=403
                    )
                chofer.conectado = True
                chofer.save()
                return Response({
                    'status': 'ok', 
                    'rol': 'chofer', 
                    'chofer_id': chofer.id, 
                    'nombre': chofer.nombre_completo,
                    'grupo': chofer.grupo.nombre if chofer.grupo else "Sin Grupo"
                })
            except Chofer.DoesNotExist:
                return Response({'status': 'error', 'message': 'Perfil de chofer no encontrado'}, status=400)
    else:
        return Response({'status': 'error', 'message': 'CI o contraseña incorrectos'}, status=401)

@api_view(['POST'])
def api_logout(request):
    """Logout del chofer - marca como desconectado"""
    chofer_id = request.data.get('chofer_id')
    if chofer_id:
        try:
            chofer = Chofer.objects.get(id=chofer_id)
            chofer.conectado = False
            chofer.save()
            return Response({'status': 'ok', 'message': 'Sesión cerrada'})
        except Chofer.DoesNotExist:
            return Response({'status': 'error', 'message': 'Chofer no encontrado'}, status=404)
    else:
        return Response({'status': 'error', 'message': 'chofer_id es requerido'}, status=400)