from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0008_grupo_ruta_remove_hojaruta_descripcion_ruta_and_more'),
    ]
    operations = [
        migrations.CreateModel(
            name='Planificacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grupo', models.CharField(max_length=100, verbose_name='Grupo Planificado')),
                ('semana', models.CharField(max_length=50, verbose_name='Semana del Año')),
                ('variable_clima', models.CharField(max_length=50, verbose_name='Variable (Clima/Bloqueos)')),
                ('rutas_asignadas', models.JSONField(verbose_name='Tabla de Rutas Generadas')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')),
            ],
            options={
                'verbose_name': 'Planificación Semanal',
                'verbose_name_plural': 'Planificaciones Semanales',
            },
        ),
    ]
