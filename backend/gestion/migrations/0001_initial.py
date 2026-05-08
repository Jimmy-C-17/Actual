import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name='Chofer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_completo', models.CharField(max_length=200)),
                ('ci', models.CharField(max_length=20, unique=True)),
                ('placa', models.CharField(max_length=15)),
                ('celular', models.CharField(max_length=15)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Usuario de acceso')),
            ],
            options={
                'verbose_name': 'Chofer',
                'verbose_name_plural': 'Choferes',
            },
        ),
        migrations.CreateModel(
            name='HojaRuta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateField()),
                ('descripcion_ruta', models.TextField()),
                ('latitud', models.FloatField(default=-16.5)),
                ('longitud', models.FloatField(default=-68.15)),
                ('completada', models.BooleanField(default=False)),
                ('chofer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='gestion.chofer')),
            ],
            options={
                'verbose_name': 'Hoja de Ruta',
                'verbose_name_plural': 'Hojas de Ruta',
            },
        ),
    ]
