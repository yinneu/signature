# my_settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # 사용할 엔진 설정
        'NAME': 'sw_signature',                # 데이터베이스 이름
        'USER': 'root',                        # 데이터베이스 사용자 이름
        'PASSWORD': 'rkskek',                  # 데이터베이스 비밀번호 (접속 계정 비밀번호)
        'HOST': '127.0.0.1',                   # 데이터베이스 호스트 주소 (실제 DB 주소)
        'PORT': '3306',                        # 데이터베이스 포트 번호
    }
}

SECRET_KEY = 'django-insecure-u)k6p$@zf_3%urtdxxuba8&x8)*o_@sq$#rnd(guu@3m#8st1c'
