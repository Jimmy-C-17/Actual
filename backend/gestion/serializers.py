from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from .models import Chofer, Vehiculo, HojaRuta, Incidente, Grupo, Ruta, Planificacion # IMPORTANTE: Agregado Planificacion

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'password', 'is_staff', 'is_superuser']

    def validate(self, data):
        username = data.get('username')
        if username:
            existing_user = User.objects.filter(username=username).exclude(pk=getattr(self.instance, 'pk', None)).first()
            if existing_user:
                raise serializers.ValidationError({'username': 'Ya existe un usuario con este nombre de usuario.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = '__all__'

class RutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ruta
        fields = '__all__'

class ChoferSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})
    usuario_acceso = serializers.SerializerMethodField()

    class Meta:
        model = Chofer
        fields = ['id', 'nombre_completo', 'ci', 'nro_socio', 'celular', 'estado_activo', 'conectado', 'grupo', 'password', 'usuario_acceso']

    def get_usuario_acceso(self, obj):
        """Retorna el username del usuario de autenticación"""
        return obj.user.username if obj.user else None

    def validate(self, data):
        if self.instance is None:
            password = data.get('password')
            if not password:
                raise serializers.ValidationError({'password': 'La contraseña es obligatoria para crear un chofer.'})

        ci = data.get('ci')
        nro_socio = data.get('nro_socio')

        if ci and Chofer.objects.filter(ci=ci).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError({'ci': 'Ya existe un chofer con este CI.'})

        if nro_socio and Chofer.objects.filter(nro_socio=nro_socio).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError({'nro_socio': 'Ya existe un chofer con este número de socio.'})

        if ci:
            existing_user = User.objects.filter(username=ci).first()
            if self.instance is None:
                if existing_user and Chofer.objects.filter(user=existing_user).exists():
                    raise serializers.ValidationError({'ci': 'Ya existe un usuario con este CI.'})
            else:
                if existing_user and existing_user != self.instance.user:
                    raise serializers.ValidationError({'ci': 'Ya existe un usuario con este CI.'})

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        ci = validated_data.get('ci')
        nombre = validated_data.get('nombre_completo')

        with transaction.atomic():
            if not ci:
                raise serializers.ValidationError({'ci': 'El CI es obligatorio para crear el usuario de acceso.'})

            user = User.objects.filter(username=ci).first()
            if user:
                if Chofer.objects.filter(user=user).exists():
                    raise serializers.ValidationError({'ci': 'Ya existe un usuario con este CI.'})
                user.set_password(password)
                user.first_name = nombre
                user.save()
            else:
                user = User.objects.create_user(
                    username=ci,
                    password=password,
                    first_name=nombre
                )

            chofer = Chofer.objects.create(user=user, **validated_data)
        return chofer

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        if password:
            if instance.user:
                instance.user.set_password(password)
                instance.user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = '__all__'

class HojaRutaSerializer(serializers.ModelSerializer):
    ruta_asignada_nombre = serializers.CharField(source='ruta_asignada.nombre', read_only=True)

    class Meta:
        model = HojaRuta
        fields = '__all__'
        read_only_fields = ['ruta_asignada_nombre']

class IncidenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidente
        fields = '__all__'

class PlanificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Planificacion
        fields = '__all__'