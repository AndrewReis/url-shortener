CREATE KEYSPACE IF NOT EXISTS url_shortener
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE url_shortener;

CREATE TABLE IF NOT EXISTS urls (
  short text PRIMARY KEY,
  original text,
  created_at timestamp
);
