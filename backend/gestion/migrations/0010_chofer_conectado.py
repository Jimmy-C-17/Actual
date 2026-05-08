from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0009_planificacion'),
    ]
    operations = [
        migrations.AddField(
            model_name='chofer',
            name='conectado',
            field=models.BooleanField(default=False, verbose_name='¿Conectado al Sistema?'),
        ),
    ]
