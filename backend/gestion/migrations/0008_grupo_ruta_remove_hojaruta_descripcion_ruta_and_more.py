import django.db.models.deletion
from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0007_remove_chofer_vehiculo_vehiculo_chofer'),
    ]
    operations = [
        migrations.CreateModel(
            name='Grupo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50, unique=True, verbose_name='Nombre del Grupo')),
            ],
            options={
                'verbose_name': 'Grupo',
                'verbose_name_plural': 'Grupos',
            },
        ),
        migrations.CreateModel(
            name='Ruta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100, unique=True, verbose_name='Destino/Ruta')),
                ('activa', models.BooleanField(default=True, verbose_name='¿Ruta Disponible?')),
            ],
            options={
                'verbose_name': 'Ruta (Catálogo)',
                'verbose_name_plural': 'Rutas (Catálogo)',
            },
        ),
        migrations.RemoveField(
            model_name='hojaruta',
            name='descripcion_ruta',
        ),
        migrations.AddField(
            model_name='hojaruta',
            name='orden_vuelta',
            field=models.IntegerField(default=1, verbose_name='Número de Vuelta (1 al 6)'),
        ),
        migrations.AlterField(
            model_name='hojaruta',
            name='chofer',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='hojas_de_ruta', to='gestion.chofer'),
        ),
        migrations.AddField(
            model_name='chofer',
            name='grupo',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='choferes', to='gestion.grupo', verbose_name='Grupo Asignado'),
        ),
        migrations.AddField(
            model_name='hojaruta',
            name='ruta_asignada',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='gestion.ruta', verbose_name='Ruta Destino'),
        ),
    ]
