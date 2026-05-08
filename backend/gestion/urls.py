from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'grupos', views.GrupoViewSet)
router.register(r'planificaciones', views.PlanificacionViewSet)
router.register(r'rutas-catalogo', views.RutaViewSet)
router.register(r'choferes', views.ChoferViewSet)
router.register(r'admins', views.AdminUserViewSet)
router.register(r'vehiculos', views.VehiculoViewSet)
router.register(r'hojarutas', views.HojaRutaViewSet)
router.register(r'incidentes', views.IncidenteViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ia/generar-planificacion/', views.api_generar_planificacion_ia, name='api_generar_planificacion_ia'),
    path('ia/prediccion-demanda/', views.api_prediccion_demanda, name='api_prediccion_demanda'),
    path('dashboard-stats/', views.api_admin_dashboard, name='api_admin_dashboard'),
    path('panel-chofer/<int:chofer_id>/', views.api_panel_chofer, name='api_panel_chofer'),
    path('login/', views.api_login, name='api_login'),
    path('logout/', views.api_logout, name='api_logout'),
]