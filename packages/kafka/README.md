# Kafka SSL Certificates

This directory contains SSL certificates for securing Kafka communication with TLS encryption.

## Certificate Generation

To generate new SSL certificates, run:

```bash
./generate-certificates.sh
```

This script creates:
- **CA Certificate & Key**: Self-signed Certificate Authority
- **Broker Certificate & Key**: Signed by the CA for the Kafka broker
- **Keystore**: PKCS12 format containing broker certificate and private key
- **Truststore**: PKCS12 format containing CA certificate for trust validation

## Security Notes

### Development vs Production

- **Current Setup**: Self-signed certificates for development/testing
- **Production**: Use CA-signed certificates from a trusted Certificate Authority

### Certificate Details

- **Validity**: 10 years (3650 days)
- **Algorithm**: RSA 2048-bit with SHA256
- **Format**: PKCS12 keystores for Kafka compatibility
- **Password**: `kafka-password` (configured in docker-compose.yml)

### File Permissions

- `.pem` files: `644` (readable by all, secure in containers)
- `.p12` files: `600` (owner-only access)

## Docker Integration

Certificates are automatically mounted to `/etc/kafka/secrets/` inside containers.

### Kafka Configuration

```yaml
# SSL/TLS Settings
KAFKA_SECURITY_INTER_BROKER_PROTOCOL: SSL
KAFKA_SSL_KEYSTORE_LOCATION: /etc/kafka/secrets/kafka.keystore.p12
KAFKA_SSL_KEYSTORE_PASSWORD: kafka-password
KAFKA_SSL_TRUSTSTORE_LOCATION: /etc/kafka/secrets/kafka.truststore.p12
KAFKA_SSL_TRUSTSTORE_PASSWORD: kafka-password

# Client Connections (development - keep PLAINTEXT for localhost)
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
KAFKA_INTER_BROKER_LISTENER_NAME: SSL
```

## Production Deployment

For production environments:

1. **Obtain CA-signed certificates** from a trusted Certificate Authority
2. **Use stronger passwords** and store them in secure secret management
3. **Enable client SSL** by changing listener protocols to SSL
4. **Implement certificate rotation** policies
5. **Use hardware security modules (HSM)** for private key storage

## Certificate Validation

To verify certificates:

```bash
# Check certificate details
openssl x509 -in kafka-secrets/broker-cert.pem -text -noout

# Verify certificate chain
openssl verify -CAfile kafka-secrets/ca-cert.pem kafka-secrets/broker-cert.pem
```

## Troubleshooting

### Common Issues

1. **"Certificate not trusted"**: Ensure CA certificate is in truststore
2. **"Bad certificate"**: Check certificate validity dates and hostnames
3. **"Handshake failure"**: Verify keystore/truststore passwords match configuration

### Logs

Check Kafka logs for SSL-related errors:
```bash
docker logs kafka-broker-1 | grep SSL
