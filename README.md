# Encurtador de URLs — Documentação Técnica

## API

### Criar URL encurtada

**POST** `/api/v1/shorten`

**Request**

```json
{ "url": "https://www.example.com/..." }
```

**Response — 201**

```json
{ "short_url": "https://bit.ly/zn9e10A" }
```

---

### Redirecionar URL

**GET** `/api/v1/shorten/{code}`

**Response**

* `301` ou `302`
* Redireciona para a URL original

---

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

*(sem considerar índices e metadados)*

---

## Banco de Dados

### Requisitos

* Escrita massiva
* Leitura intensiva
* Alta disponibilidade
* Escala horizontal

### Escolha

**Apache Cassandra**

**Modelo**

* `short_code` (PK)
* `long_url`
* `created_at`

Motivo: throughput alto, replicação nativa, retenção longa.

---

## Design do Short Code

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

## Geração do Código

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

## Segurança

### Ofuscação

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

* Redis: geração de IDs + cache de leitura
* Banco acessado apenas em cache miss
* API externa não necessária em runtime