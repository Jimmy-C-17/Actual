import django.db.models.deletion
from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0005_hojaruta_fecha_completada_hojaruta_latitud_final_and_more'),
    ]
    operations = [
        migrations.CreateModel(
            name='Incidente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(max_length=100, verbose_name='Tipo de Incidente')),
                ('descripcion', models.TextField(verbose_name='Descripción del problema')),
                ('fecha_reporte', models.DateTimeField(auto_now_add=True)),
                ('ruta', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='incidentes', to='gestion.hojaruta')),
            ],
            options={
                'verbose_name': 'Incidente',
                'verbose_name_plural': 'Incidentes',
            },
        ),
    ]
