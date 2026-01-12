# Encurtador de URLs — Documentação Técnica

## Requisitos Funcionais
* Gerar URL encurtada a partir de uma URL longa
* Redirecionar URL encurtada para a URL original

---

## Requisitos Não Funcionais
* Suportar **100 milhões de URLs/dia**
* Alta disponibilidade (**24/7**)
* Relação **1 write : 10 reads**
* URLs armazenadas por **mínimo de 10 anos**
* URL curta com **menor comprimento possível**
* Charset permitido: `[0-9][a-z][A-Z]` (Base62)
* Tamanho médio da URL longa: **100 bytes**

---

## Estimativas de Carga

### Escritas

* 100.000.000 URLs/dia
* 86.400 segundos/dia

```
Writes/s ≈ 100.000.000 / 86.400 ≈ 1.157
```

---

### Leituras

* 10 leituras por escrita

```
Reads/s ≈ 11.570
```

---

## Estimativa de Armazenamento

### Volume de dados

* 100M URLs/dia
* Retenção: 10 anos

```
Total URLs = 100.000.000 × 365 × 10
≈ 365 bilhões de registros
```

---

### Capacidade

* 100 bytes por URL

```
365B × 100 bytes ≈ 36,5 TB
```

---

# Banco de Dados
**Apache Cassandra**

### Comandos:
``` bash
docker exec -it cassandra cqlsh
```

**READ ALL**
```bash 
SELECT * FROM url_shortener.urls;
``` 

**CREATE (insert)**
```bash 
INSERT INTO url_shortener.urls (short, original, created_at)
VALUES ('2tx', 'https://example.com', toTimestamp(now()));
``` 

**READ (select)**
```bash 
SELECT * FROM url_shortener.urls WHERE short = '2tx';
``` 

**UPDATE**
```bash 
UPDATE url_shortener.urls
SET original = 'https://example.org'
WHERE short = '2tx';
``` 

**DELETE**
```bash 
DELETE FROM url_shortener.urls WHERE short = '2tx';
``` 

**Modelo**

* `short_code` (PK)
* `long_url`
* `created_at`

Motivo: throughput alto, replicação nativa, retenção longa.

---

### Charset

* 10 números
* 26 letras minúsculas
* 26 letras maiúsculas

**Total:** 62 caracteres → **Base62**

---

### Capacidade por comprimento

| Caracteres | Combinações      |
| ---------- | ---------------- |
| 5          | 916 milhões      |
| 6          | 56,8 bilhões     |
| 7          | **3,5 trilhões** |

➡️ **7 caracteres** suportam crescimento com folga.

---

### Estratégia

* Contador incremental global
* Conversão do ID para Base62

Exemplo conceitual:

```
ID numérico → Base62 → short_code
```

Resultado:

```
https://bit.ly/2tx
```

---

## Segurança (Hash + Ofuscação)
* O ID sequencial **não deve ser exposto diretamente**
* Aplicar:

  * Permutação
  * Encoding
  * Chave secreta

Objetivo: evitar enumeração previsível de URLs.

---

## Arquitetura (Alto Nível)

```
Usuários
   ↓
Load Balancer
   ↓
Web Servers (stateless)
   ↓
Redis (INCR global / cache)
   ↓
Cassandra
```

# Testes
curl -X POST -H "Content-Type: application/json" -d '{"url": "https://github.com/AndrewReis"}' http://localhost:3000/api/v1/shorten && echo

curl -s http://localhost:3000/api/v1/shorten/7e20ABk && echo


docker compose run --rm k6 run /scripts/k6.js


## K6 + INFLUXDB + GRAFANA
| Componente                      | Função              |
| ------------------------------- | ------------------- |
| Sua aplicação (Node, API, etc.) | Receber requisições |
| k6                              | Simular usuários    |
| InfluxDB                        | Armazenar métricas  |
| Grafana                         | Visualizar métricas |



# Referencias
https://medium.com/swlh/beautiful-load-testing-with-k6-and-docker-compose-4454edb3a2e3

