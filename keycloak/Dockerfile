FROM quay.io/keycloak/keycloak:latest

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true

# Configure database vendor
ENV KC_DB=postgres

# Startup command optimized for production/cloud proxy setup
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", "--optimized"]