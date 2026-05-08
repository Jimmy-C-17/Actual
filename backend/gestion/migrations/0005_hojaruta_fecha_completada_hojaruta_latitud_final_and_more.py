from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('gestion', '0004_alter_chofer_user'),
    ]
    operations = [
        migrations.AddField(
            model_name='hojaruta',
            name='fecha_completada',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hojaruta',
            name='latitud_final',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hojaruta',
            name='longitud_final',
            field=models.FloatField(blank=True, null=True),
        ),
    ]