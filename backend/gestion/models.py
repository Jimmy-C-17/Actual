from django.db import models
from django.contrib.auth.models import User

class Grupo(models.Model):
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre del Grupo")
    
    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "Grupo"
        verbose_name_plural = "Grupos"

class Ruta(models.Model):
    nombre = models.CharField(max_length=100, unique=True, verbose_name="Destino/Ruta")
    activa = models.BooleanField(default=True, verbose_name="¿Ruta Disponible?")
    coordenadas = models.JSONField(default=list, blank=True, null=True, verbose_name="Coordenadas de la ruta")

    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "Ruta (Catálogo)"
        verbose_name_plural = "Rutas (Catálogo)"

class Chofer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Usuario de acceso", null=True, blank=True)
    nombre_completo = models.CharField(max_length=200)
    ci = models.CharField(max_length=20, unique=True)
    nro_socio = models.IntegerField(unique=True, verbose_name="Número de Socio", null=True)
    celular = models.CharField(max_length=15)
    estado_activo = models.BooleanField(default=True, verbose_name="¿Socio Activo?")
    conectado = models.BooleanField(default=False, verbose_name="¿Conectado al Sistema?")
    grupo = models.ForeignKey(Grupo, on_delete=models.SET_NULL, null=True, blank=True, related_name="choferes", verbose_name="Grupo Asignado")

    def __str__(self):
        return f"{self.nombre_completo} - Socio {self.nro_socio}"
    class Meta:
        verbose_name = "Chofer"
        verbose_name_plural = "Choferes"

class Vehiculo(models.Model):
    placa = models.CharField(max_length=15, unique=True, verbose_name="Placa")
    modelo = models.CharField(max_length=50, verbose_name="Modelo/Marca")
    nro_motor = models.CharField(max_length=50, blank=True, null=True, verbose_name="Número de Motor")
    nro_licencia = models.CharField(max_length=50, blank=True, null=True, verbose_name="Licencia de Transporte")
    
    chofer = models.OneToOneField(Chofer, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehiculo_asignado', verbose_name="Chofer Asignado")

    def __str__(self):
        return f"{self.modelo} - {self.placa}"
    class Meta:
        verbose_name = "Vehículo"
        verbose_name_plural = "Vehículos"

class HojaRuta(models.Model):
    chofer = models.ForeignKey(Chofer, on_delete=models.CASCADE, related_name='hojas_de_ruta')
    ruta_asignada = models.ForeignKey(Ruta, on_delete=models.CASCADE, null=True, verbose_name="Ruta Destino")
    fecha = models.DateField()
    orden_vuelta = models.IntegerField(default=1, verbose_name="Número de Vuelta (1 al 6)") 
    latitud = models.FloatField(default=-16.500) 
    longitud = models.FloatField(default=-68.150)
    completada = models.BooleanField(default=False)
    latitud_final = models.FloatField(null=True, blank=True)
    longitud_final = models.FloatField(null=True, blank=True)
    fecha_completada = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Vuelta {self.orden_vuelta} | {self.fecha} - {self.chofer.nombre_completo} -> {self.ruta_asignada}"
    class Meta:
        verbose_name = "Hoja de Ruta"
        verbose_name_plural = "Hojas de Ruta"

class Incidente(models.Model):
    ruta = models.ForeignKey(HojaRuta, on_delete=models.CASCADE, related_name='incidentes')
    tipo = models.CharField(max_length=100, verbose_name="Tipo de Incidente")
    descripcion = models.TextField(verbose_name="Descripción del problema")
    fecha_reporte = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.ruta.chofer.nombre_completo}"
    class Meta:
        verbose_name = "Incidente"
        verbose_name_plural = "Incidentes"

class Planificacion(models.Model):
    grupo = models.CharField(max_length=100, verbose_name="Grupo Planificado")
    semana = models.CharField(max_length=50, verbose_name="Semana del Año")
    variable_clima = models.CharField(max_length=50, verbose_name="Variable (Clima/Bloqueos)")
    rutas_asignadas = models.JSONField(verbose_name="Tabla de Rutas Generadas") 
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")

    def __str__(self):
        return f"Planificación {self.grupo} - {self.semana}"
        
    class Meta:
        verbose_name = "Planificación Semanal"
        verbose_name_plural = "Planificaciones Semanales"