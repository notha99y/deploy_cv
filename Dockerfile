FROM nvcr.io/nvidia/cuda:10.0-cudnn7-devel-ubuntu18.04


RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    curl \
    ca-certificates \
    libjpeg-dev \
    python3-dev \
    python3-pip \
    libpng-dev && \
    rm -rf /var/lib/apt/lists/* 

COPY deploy_cv /deploy_cv

WORKDIR /deploy_cv

RUN pip3 install --no-cache-dir --upgrade pip setuptools

RUN pip3 install --no-cache Flask \
    gunicorn \
    Jinja2 \
    numpy \
    Pillow \
    scipy \
    torch==1.5.0 \
    torchvision==0.6  \
    Werkzeug

EXPOSE 5001

ENV HOME /root/

COPY thub_checkpoints $HOME/.cache/torch/hub/checkpoints 

SHELL ["/bin/bash", "-c"]

CMD ["gunicorn", "app:app", "-b", "0.0.0.0:5001"]

# Run the app.  CMD is required to run on Heroku
# $PORT is set by Heroku
