from django.contrib import admin
from .models import Grupo, Ruta, Chofer, Vehiculo, HojaRuta, Incidente

@admin.register(Grupo)
class GrupoAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)

@admin.register(Ruta)
class RutaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'activa')
    list_editable = ('activa',)
    search_fields = ('nombre',)

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ('placa', 'modelo', 'nro_licencia', 'chofer')
    search_fields = ('placa', 'modelo')

@admin.register(Chofer)
class ChoferAdmin(admin.ModelAdmin):
    list_display = ('nombre_completo', 'nro_socio', 'ci', 'celular', 'grupo', 'estado_activo')
    list_editable = ('estado_activo',)
    search_fields = ('nombre_completo', 'ci', 'nro_socio')
    list_filter = ('grupo', 'estado_activo')

@admin.register(HojaRuta)
class HojaRutaAdmin(admin.ModelAdmin):
    list_display = ('chofer', 'ruta_asignada', 'orden_vuelta', 'fecha', 'completada')
    list_filter = ('fecha', 'completada', 'ruta_asignada')
    search_fields = ('chofer__nombre_completo',)

@admin.register(Incidente)
class IncidenteAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'ruta', 'fecha_reporte')
    list_filter = ('tipo', 'fecha_reporte')
    search_fields = ('descripcion',)