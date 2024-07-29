#!/bin/bash

helm repo add nginx-stable https://helm.nginx.com/stable

helm repo update

# --set controller.service.loadBalancerIP="34.27.24.41" \
helm upgrade --install --create-namespace \
  nginx-ingress-canon nginx-stable/nginx-ingress \
  --set controller.name=nginx-ingress-canon \
  --set controller.service.name=nginx-ingress-canon-service \
  --set controller.enableSnippets=true \
  --set controller.ingressClass.name=nginx-canon \
  --set controller.ingressClass.create=true \
  --set controller.image.tag=3.6.1 \
  --set controller.debug.enable=false \
  --set persistentVolume.nfs.server=$CACHE_IP_BOSTON \
  --values=./helm/nginx/canon.yaml \
  --namespace nginx-ingress-canon
