import cassandra from 'cassandra-driver';

const cassandraClient = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE
});

await cassandraClient.connect()

export { cassandraClient };