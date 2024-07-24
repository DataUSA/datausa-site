#!/bin/bash

helm repo add nginx-stable https://helm.nginx.com/stable

helm repo update

helm upgrade --install --create-namespace \
  nginx-ingress-canon nginx-stable/nginx-ingress \
  --set controller.name=nginx-ingress-canon \
  --set controller.service.name=nginx-ingress-canon-service \
  --set controller.enableSnippets=true \
  --set controller.ingressClass.name=nginx-canon \
  --set controller.ingressClass.create=true \
  --set controller.image.tag=3.6.1 \
  --set controller.debug.enable=false \
  --set controller.volumes[0].name=canon-site-boston-cache \
  --set controller.volumes[0].persistentVolumeClaim.claimName=canon-site-boston-pvc \
  --set controller.volumeMounts[0].name=canon-site-boston-cache \
  --set controller.volumeMounts[0].mountPath=/opt/sfw \
  --set controller.volumeMounts[0].subPath=boston \
  --namespace nginx-ingress-canon
