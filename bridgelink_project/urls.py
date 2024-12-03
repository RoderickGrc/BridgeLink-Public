"""
URL configuration for bridgelink_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from engine import views as EngineViews

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', EngineViews.index, name='index'),  # Start
    path('set_case/', EngineViews.set_case, name="set_case"),
    path('chat_messages/', EngineViews.chat_messages, name="chat_messages"),
    path('tts/', EngineViews.tts, name="tts"),
    path('text_cleaning/', EngineViews.text_cleaning, name="text_cleaning"),
    path('start_lessa_recognition', EngineViews.start_lessa_recognition, name='start_lessa_recognition'),
    path('stop_lessa_recognition', EngineViews.stop_lessa_recognition, name='stop_lessa_recognition'),
    path('get_current_lessa_data', EngineViews.get_current_lessa_data, name='get_current_lessa_data'),
    #path('', EngineViews.something, name='something'),


]
